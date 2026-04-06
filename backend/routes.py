from flask import Blueprint, request, jsonify
from extensions import db, socketio
from models import User, FoodItem, PickupSlot
from uuid import uuid4

main = Blueprint('main', __name__)

@main.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    name = data.get('name')
    user_type = data.get('type')
    
    user = User.query.filter_by(email=email).first()
    if not user:
        if user_type == 'admin':
            admin_key = data.get('adminKey')
            if admin_key != 'FOOD_SYS_ADMIN_2026':
                return jsonify({'error': 'Invalid Admin Secret Key'}), 401
                
        # Create user if doesn't exist
        user = User(
            id=str(uuid4()),
            name=name or email.split('@')[0],
            email=email,
            type=user_type,
            latitude=data.get('latitude', 40.7128),
            longitude=data.get('longitude', -74.0060),
            address=data.get('address')
        )
        db.session.add(user)
        db.session.commit()
    
    return jsonify({
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'type': user.type,
        'latitude': user.latitude,
        'longitude': user.longitude,
        'address': user.address,
        'preferences': user.preferences.split(',') if user.preferences else []
    })

@main.route('/api/user/<user_id>', methods=['PATCH'])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json
    
    if 'name' in data:
        user.name = data['name']
    if 'email' in data:
        user.email = data['email']
    if 'address' in data:
        user.address = data['address']
        
    db.session.commit()
    
    return jsonify({
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'type': user.type,
        'latitude': user.latitude,
        'longitude': user.longitude,
        'address': user.address,
        'preferences': user.preferences.split(',') if user.preferences else []
    })

@main.route('/api/food', methods=['GET'])
def get_food():
    items = FoodItem.query.all()
    return jsonify([item.to_dict() for item in items])

@main.route('/api/food', methods=['POST'])
def add_food():
    data = request.json
    new_item = FoodItem(
        id=str(uuid4()),
        donor_id=data['donorId'],
        donor_name=data['donorName'],
        name=data['name'],
        quantity=data['quantity'],
        expiry=data['expiry'],
        expiry_time=data['expiryTime'],
        location=data['location'],
        latitude=data['latitude'],
        longitude=data['longitude'],
        created_at=data['createdAt'],
        status='available'
    )
    
    db.session.add(new_item)
    
    # Add pickup slots
    for slot_data in data.get('pickupSlots', []):
        slot = PickupSlot(
            id=str(uuid4()),
            food_item_id=new_item.id,
            start_time=slot_data['startTime'],
            end_time=slot_data['endTime'],
            is_available=slot_data.get('isAvailable', True)
        )
        db.session.add(slot)
        
    db.session.commit()
    
    # Emit real-time event to update connected clients
    socketio.emit('food_updated', {'action': 'added', 'item': new_item.to_dict()})
    
    return jsonify(new_item.to_dict()), 201

@main.route('/api/food/<item_id>', methods=['PUT', 'PATCH'])
def update_food(item_id):
    item = FoodItem.query.get_or_404(item_id)
    data = request.json
    
    if 'status' in data:
        item.status = data['status']
    if 'reservedBy' in data:
        item.reserved_by = data['reservedBy']
        
    if 'pickupSlots' in data:
        for slot_data in data['pickupSlots']:
            slot = PickupSlot.query.get(slot_data['id'])
            if slot:
                slot.is_available = slot_data.get('isAvailable', True)
                
    db.session.commit()
    
    # Emit real-time update
    socketio.emit('food_updated', {'action': 'updated', 'item': item.to_dict()})
    
    return jsonify(item.to_dict())

@main.route('/api/food/<item_id>', methods=['DELETE'])
def delete_food(item_id):
    item = FoodItem.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    
    socketio.emit('food_updated', {'action': 'deleted', 'id': item_id})
    return jsonify({'success': True})

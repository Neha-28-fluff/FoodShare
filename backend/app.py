from flask import Flask
from extensions import db, socketio
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'my_super_secret_dev_key'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///food_v2.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    CORS(app)
    db.init_app(app)
    socketio.init_app(app, cors_allowed_origins="*")

    with app.app_context():
        from models import User, FoodItem, PickupSlot, Review
        from routes import main
        app.register_blueprint(main)
        
        # Create database tables
        db.create_all()
        
        # Seed the database if empty
        if not FoodItem.query.first():
            seed_data(db, User, FoodItem, PickupSlot)

    return app

def seed_data(db, User, FoodItem, PickupSlot):
    import uuid
    from datetime import datetime
    
    donor1_id = str(uuid.uuid4())
    donor2_id = str(uuid.uuid4())
    
    donor1 = User(id=donor1_id, name='Green Valley Restaurant', email='donor1@test.com', type='donor')
    donor2 = User(id=donor2_id, name='Sunrise Bakery', email='donor2@test.com', type='donor')
    receiver1 = User(id=str(uuid.uuid4()), name='John Doe', email='receiver1@test.com', type='receiver', preferences='vegetables,bread')
    
    db.session.add_all([donor1, donor2, receiver1])
    
    item1 = FoodItem(
        id=str(uuid.uuid4()), donor_id=donor1_id, donor_name=donor1.name, name='Fresh Vegetables',
        quantity='5 kg', expiry='2026-02-13', expiry_time='18:00', status='available',
        location='Downtown', latitude=40.7128, longitude=-74.0060, created_at=datetime.utcnow().isoformat()
    )
    
    item2 = FoodItem(
        id=str(uuid.uuid4()), donor_id=donor2_id, donor_name=donor2.name, name='Bread & Pastries',
        quantity='20 pieces', expiry='2026-02-12', expiry_time='20:00', status='reserved',
        reserved_by=receiver1.id, location='Main Street', latitude=40.7128, longitude=-74.0060, created_at=datetime.utcnow().isoformat()
    )
    
    db.session.add_all([item1, item2])
    db.session.flush()
    
    slot1 = PickupSlot(id=str(uuid.uuid4()), food_item_id=item1.id, start_time='18:00', end_time='19:00', is_available=True)
    slot2 = PickupSlot(id=str(uuid.uuid4()), food_item_id=item2.id, start_time='20:00', end_time='21:00', is_available=False)
    
    db.session.add_all([slot1, slot2])
    db.session.commit()
    print("Database seeded with sample data.")

if __name__ == '__main__':
    app = create_app()
    socketio.run(app, debug=True, port=5000)

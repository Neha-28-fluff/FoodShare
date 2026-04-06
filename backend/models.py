from extensions import db

class User(db.Model):
    id = db.Column(db.String(100), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    type = db.Column(db.String(20), nullable=False) # donor, receiver, admin
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    address = db.Column(db.String(255), nullable=True)
    preferences = db.Column(db.String(255), nullable=True)

class PickupSlot(db.Model):
    id = db.Column(db.String(100), primary_key=True)
    food_item_id = db.Column(db.String(100), db.ForeignKey('food_item.id'), nullable=False)
    start_time = db.Column(db.String(20), nullable=False)
    end_time = db.Column(db.String(20), nullable=False)
    is_available = db.Column(db.Boolean, default=True)

class FoodItem(db.Model):
    id = db.Column(db.String(100), primary_key=True)
    donor_id = db.Column(db.String(100), db.ForeignKey('user.id'), nullable=False)
    donor_name = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.String(50), nullable=False)
    expiry = db.Column(db.String(20), nullable=False)
    expiry_time = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='available') # available, reserved, expired, completed
    reserved_by = db.Column(db.String(100), db.ForeignKey('user.id'), nullable=True)
    location = db.Column(db.String(150), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.String(50), nullable=False)
    
    slots = db.relationship('PickupSlot', backref='food_item', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'donorId': self.donor_id,
            'donorName': self.donor_name,
            'name': self.name,
            'quantity': self.quantity,
            'expiry': self.expiry,
            'expiryTime': self.expiry_time,
            'status': self.status,
            'reservedBy': self.reserved_by,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'createdAt': self.created_at,
            'pickupSlots': [
                {
                    'id': slot.id,
                    'startTime': slot.start_time,
                    'endTime': slot.end_time,
                    'isAvailable': slot.is_available
                } for slot in self.slots
            ]
        }

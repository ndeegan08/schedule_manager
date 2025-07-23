import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=r"C:\Users\kwart\OneDrive\415Project\CSIT415\env\database.env")

# Flask app setup
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins
bcrypt = Bcrypt(app)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_HEADER_TYPE"] = "Bearer"  #  Required to parse Bearer token correctly
jwt = JWTManager(app)

# Database config
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")

app.config["SQLALCHEMY_DATABASE_URI"] = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# Association table
user_courses = db.Table("user_courses",
    db.Column("user_id", db.Integer, db.ForeignKey("user.id")),
    db.Column("course_id", db.Integer, db.ForeignKey("course.id"))
)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    courses = db.relationship("Course", secondary=user_courses, backref="users")

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_number = db.Column(db.String(50), nullable=False)
    section = db.Column(db.String(10), nullable=True)
    course_name = db.Column(db.String(200), nullable=False)
    instructor = db.Column(db.String(100), nullable=True)
    crn = db.Column(db.String(20), nullable=False)
    start_time = db.Column(db.String(255), nullable=True)
    end_time = db.Column(db.String(255), nullable=True)
    days = db.Column(db.String(255), nullable=True)
    building = db.Column(db.String(100), nullable=True)
    room = db.Column(db.String(20), nullable=True)
    start_date = db.Column(db.String(20), nullable=True)
    end_date = db.Column(db.String(20), nullable=True)
    asynchronous = db.Column(db.Boolean, default=False)

# Create tables
with app.app_context():
    db.create_all()

# Routes
@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Backend is running!"}), 200

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    hashed_password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    new_user = User(
        first_name=data["first_name"],
        last_name=data["last_name"],
        username=data["email"].lower(),
        email=data["email"].lower(),
        password=hashed_password
    )
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"id": new_user.id, "username": new_user.username}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"].lower()).first()
    if user and bcrypt.check_password_hash(user.password, data["password"]):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({"token": access_token})
    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/courses", methods=["GET"])
def get_courses():
    query = request.args.get("query", "").lower()
    courses = Course.query.filter(
        (Course.course_number.ilike(f"%{query}%")) |
        (Course.course_name.ilike(f"%{query}%"))
    ).all()
    return jsonify([{
        "id": c.id,
        "course_number": c.course_number,
        "section": c.section,
        "course_name": c.course_name,
        "instructor": c.instructor,
        "crn": c.crn
    } for c in courses])

@app.route("/courses/<int:course_id>", methods=["GET"])
def get_course(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404

    clean_start_time = course.start_time.split("\n")[-1].strip() if course.start_time else ""
    clean_end_time = course.end_time.split("Type:")[0].strip() if course.end_time and "Type:" in course.end_time else course.end_time

    return jsonify({
        "id": course.id,
        "course_number": course.course_number,
        "section": course.section,
        "course_name": course.course_name,
        "instructor": course.instructor,
        "crn": course.crn,
        "startTime": clean_start_time,
        "endTime": clean_end_time,
        "days": course.days,
        "building": course.building,
        "room": course.room,
        "startDate": course.start_date,
        "endDate": course.end_date,
        "asynchronous": course.asynchronous
    }), 200

@app.route("/save_course", methods=["POST"])
@jwt_required()
def save_course():
    user_id = get_jwt_identity()
    course_id = request.json.get("course_id")
    user = User.query.get(user_id)
    course = Course.query.get(course_id)
    if not user or not course:
        return jsonify({"error": "User or Course not found"}), 404
    if course not in user.courses:
        user.courses.append(course)
        db.session.commit()
    return jsonify({"message": "Course added to user successfully."}), 200

@app.route("/user_courses", methods=["GET"])
@jwt_required()
def get_user_courses():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify([{
        "id": c.id,
        "course_number": c.course_number,
        "section": c.section,
        "course_name": c.course_name,
        "instructor": c.instructor,
        "crn": c.crn,
        "startTime": c.start_time,
        "endTime": c.end_time,
        "days": c.days,
        "building": c.building,
        "room": c.room,
        "startDate": c.start_date,
        "endDate": c.end_date,
        "asynchronous": c.asynchronous
    } for c in user.courses]), 200

if __name__ == "__main__":
    app.run(debug=True)

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models import User, UserRole, Employee
from app.schemas import Token, UserLogin, UserCreate, UserOut
from app.core.security import verify_password, get_password_hash, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # form_data.username will contain the user email
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated"
        )
    
    access_token = create_access_token(subject=user.id)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if email is already taken
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
    
    # If employee_id is specified, verify it exists and is unlinked
    if user_in.employee_id:
        emp = db.query(Employee).filter(Employee.id == user_in.employee_id).first()
        if not emp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Referenced employee does not exist"
            )
        existing_emp_user = db.query(User).filter(User.employee_id == user_in.employee_id).first()
        if existing_emp_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account is already linked to this employee"
            )

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        employee_id=user_in.employee_id,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/me")
def read_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "employee_id": current_user.employee_id,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
        "employee": None
    }
    if current_user.employee:
        emp = current_user.employee
        profile["employee"] = {
            "id": emp.id,
            "employee_id": emp.employee_id,
            "first_name": emp.first_name,
            "last_name": emp.last_name,
            "email": emp.email,
            "phone_number": emp.phone_number,
            "job_designation": emp.job_designation,
            "department_id": emp.department_id,
            "department_name": emp.department.name if emp.department else None,
            "employment_status": emp.employment_status,
            "employment_type": emp.employment_type,
            "salary": float(emp.salary) if emp.salary else 0.0,
            "joining_date": emp.joining_date.isoformat() if emp.joining_date else None,
            "profile_image_url": emp.profile_image_url
        }
    return profile


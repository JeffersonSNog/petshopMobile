# Pet Adopt REST API Documentation

This documentation describes the endpoints, methods, headers, payload requirements, and response structures for the Pet Adopt API (`https://petadopt.onrender.com`).

---

## Authentication

Most endpoints (except registration, login, and listing pets) require a JWT (JSON Web Token) authorization header.

```http
Authorization: Bearer <your_token_here>
```

---

## User Endpoints (`/user/...`)

### 1. Register User
Creates a new user profile on the platform.

- **URL**: `/user/register`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Request Body (JSON)**:
```json
{
  "name": "John Doe",
  "email": "johndoe@email.com",
  "phone": "11999999999",
  "password": "strongpassword123",
  "confirmpassword": "strongpassword123"
}
```
- **Response (201 Created)**:
```json
{
  "message": "Usuário cadastrado com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTBhM2Q4Y2ZjNTlkNGNiNDk4YmUwMiIsImlhdCI6MTczMzc5NTYzNiwiZXhwIjoxNzMzODM4ODM2fQ..."
}
```

---

### 2. Login User
Authenticates a user and returns an access token.

- **URL**: `/user/login`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Request Body (JSON)**:
```json
{
  "email": "johndoe@email.com",
  "password": "strongpassword123"
}
```
- **Response (200 OK)**:
```json
{
  "message": "Login realizado com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTBhM2Q4Y2ZjNTlkNGNiNDk4YmUwMiIsImlhdCI6MTczMzc5NTYzNiwiZXhwIjoxNzMzODM4ODM2fQ..."
}
```

---

### 3. Check Session / User Info
Verifies the current session token and returns details of the authenticated user.

- **URL**: `/user/checkuser`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response (200 OK)**:
```json
{
  "_id": "6750a3d8cfc59d4cb498be02",
  "name": "John Doe",
  "email": "johndoe@email.com",
  "phone": "11999999999",
  "isAdmin": false,
  "createdAt": "2024-12-04T18:47:52.785Z",
  "updatedAt": "2024-12-04T18:47:52.785Z",
  "__v": 0
}
```

---

### 4. List All Users (Admin)
Retrieves a list of all registered users on the system.

- **URL**: `/user/users`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <token>` (Admin account required)
- **Response (200 OK)**:
```json
[
  {
    "_id": "6750a3d8cfc59d4cb498be02",
    "name": "John Doe",
    "email": "johndoe@email.com",
    "phone": "11999999999",
    "isAdmin": false
  },
  {
    "_id": "6750a3d8cfc59d4cb498be05",
    "name": "Jane Smith",
    "email": "janesmith@email.com",
    "phone": "11988888888",
    "isAdmin": true
  }
]
```

---

## Pet Endpoints (`/pet/...`)

### 1. List Pets (Paginated)
Retrieves all pets registered on the platform with pagination metadata.

- **URL**: `/pet/pets`
- **Method**: `GET`
- **Response (200 OK)**:
```json
{
  "pagination": {
    "total": 154,
    "page": 1,
    "limit": 10,
    "totalPages": 16
  },
  "pets": [
    {
      "_id": "6750a42fc0f32c7550898d39",
      "name": "Ricardinho",
      "age": 7,
      "weight": 10,
      "color": "preto",
      "images": [
        "https://i.ibb.co/q7rDwbb/images.jpg"
      ],
      "user": {
        "_id": "6750a3d8cfc59d4cb498be02",
        "name": "Lucas Santos",
        "email": "lucas@lucas.lucas",
        "phone": "11959",
        "isAdmin": false
      },
      "isVerified": true,
      "available": true,
      "createdAt": "2024-12-04T18:49:19.526Z",
      "updatedAt": "2024-12-04T18:49:19.526Z",
      "__v": 0
    }
  ]
}
```

---

### 2. Get Pet by ID
Retrieves the details of a specific pet.

- **URL**: `/pet/{id}`
- **Method**: `GET`
- **Response (200 OK)**:
```json
{
  "_id": "6750a42fc0f32c7550898d39",
  "name": "Ricardinho",
  "age": 7,
  "weight": 10,
  "color": "preto",
  "images": [
    "https://i.ibb.co/q7rDwbb/images.jpg"
  ],
  "user": {
    "_id": "6750a3d8cfc59d4cb498be02",
    "name": "Lucas Santos",
    "email": "lucas@lucas.lucas",
    "phone": "11959",
    "isAdmin": false
  },
  "isVerified": true,
  "available": true,
  "createdAt": "2024-12-04T18:49:19.526Z",
  "updatedAt": "2024-12-04T18:49:19.526Z",
  "__v": 0
}
```

---

### 3. Create Pet
Adds a new pet to the platform. 

> [!NOTE]
> Can be sent as `application/json` (standard data) or `multipart/form-data` if uploading image files.

- **URL**: `/pet/create`
- **Method**: `POST`
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body (JSON)**:
```json
{
  "name": "Bolinha",
  "breed": "Vira-lata",
  "gender": "male",
  "age": 3,
  "weight": 8,
  "color": "Caramelo",
  "story": "Encontrado na rua, muito dócil.",
  "available": true,
  "category": "6750a503c0f32c7550898d77"
}
```
- **Response (201 Created)**:
```json
{
  "message": "Pet cadastrado com sucesso!",
  "pet": {
    "_id": "6750a503c0f32c7550898d99",
    "name": "Bolinha",
    "breed": "Vira-lata",
    "gender": "male",
    "age": 3,
    "weight": 8,
    "color": "Caramelo",
    "story": "Encontrado na rua, muito dócil.",
    "available": true,
    "category": "6750a503c0f32c7550898d77",
    "user": "6750a3d8cfc59d4cb498be02",
    "images": [],
    "isVerified": false,
    "createdAt": "2026-05-23T02:00:00.000Z",
    "updatedAt": "2026-05-23T02:00:00.000Z",
    "__v": 0
  }
}
```

---

### 4. Edit Pet Profile
Modifies details of an existing pet profile.

- **URL**: `/pet/edit/{id}`
- **Method**: `PATCH`
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body (JSON)**:
```json
{
  "name": "Bolinha",
  "age": 4,
  "available": false
}
```
- **Response (200 OK)**:
```json
{
  "message": "Pet atualizado com sucesso!"
}
```

---

### 5. Get Categories
Retrieves all categories of pets (e.g. Dog, Cat).

- **URL**: `/pet/category`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response (200 OK)**:
```json
[
  {
    "_id": "6750a503c0f32c7550898d77",
    "name": "Cães",
    "createdAt": "2024-12-04T18:49:19.526Z",
    "updatedAt": "2024-12-04T18:49:19.526Z"
  },
  {
    "_id": "6750a634cfc59d4cb498be9d",
    "name": "Gatos",
    "createdAt": "2024-12-04T18:50:00.000Z",
    "updatedAt": "2024-12-04T18:50:00.000Z"
  }
]
```

---

### 6. Get My Registered Pets
Lists all pets uploaded by the currently authenticated user.

- **URL**: `/pet/mypets`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response (200 OK)**:
```json
[
  {
    "_id": "6750a503c0f32c7550898d99",
    "name": "Bolinha",
    "breed": "Vira-lata",
    "available": true
  }
]
```

---

## Adoption Endpoints (`/adoption/...`)

### 1. Get My Adoptions
Retrieves a list of pets the authenticated user has scheduled or requested to adopt.

- **URL**: `/adoption/myadoptions`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response (200 OK)**:
```json
[
  {
    "_id": "6750a42fc0f32c7550898d39",
    "name": "Ricardinho",
    "breed": "Poodle",
    "available": false,
    "adopter": "6750a3d8cfc59d4cb498be02"
  }
]
```

---

### 2. Schedule Adoption Visit
Initiates an adoption process by scheduling a visit to see the pet.

- **URL**: `/adoption/schedule/{id}`
- **Method**: `PATCH`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response (200 OK)**:
```json
{
  "message": "Visita agendada com sucesso! Entre em contato com o dono do pet."
}
```

---

### 3. Conclude Adoption
Concludes the adoption process, updating the status of the pet as adopted.

- **URL**: `/adoption/conclude/{id}`
- **Method**: `PATCH`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response (200 OK)**:
```json
{
  "message": "Adoção concluída com sucesso! Parabéns!"
}
```

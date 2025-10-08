# Test Parent Avatar Upload API

## Endpoint
`POST /api/parents/upload-avatar/:id`

## Headers
```
Authorization: Bearer {your_access_token}
Content-Type: multipart/form-data
```

## Body (form-data)
- `file`: [Select image file]

## Test Cases

### 1. Successful Upload
```bash
curl -X POST \
  http://localhost:3000/api/parents/upload-avatar/PH00001 \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -F 'file=@path/to/your/image.jpg'
```

### 2. No File
```bash
curl -X POST \
  http://localhost:3000/api/parents/upload-avatar/PH00001 \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### 3. No Authorization
```bash
curl -X POST \
  http://localhost:3000/api/parents/upload-avatar/PH00001 \
  -F 'file=@path/to/your/image.jpg'
```

## Expected Response (Success)
```json
{
  "parent_id": "PH00001",
  "name": "Nguyễn Văn A",
  "avatar": "https://res.cloudinary.com/your_cloud/image/upload/v1234567890/account_avatar/filename.jpg",
  "message": "Avatar uploaded successfully"
}
```

## Expected Errors
- 400: "No file uploaded"
- 403: "Forbidden" or "You can only update your own avatar"
- 404: "Parent not found"
- 500: "Avatar upload failed" or "Internal server error"

## Notes
- File size limit: 10MB
- Supported formats: Images (jpg, png, gif, etc.)
- Old avatar will be automatically deleted from Cloudinary
- Only the parent themselves can update their avatar
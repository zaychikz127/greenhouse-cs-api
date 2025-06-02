// hash-password.js
const bcrypt = require('bcrypt');
const plainPassword = 'pass1234'; // ← แก้ตรงนี้เป็นรหัสผ่านที่คุณต้องการ
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log('Hashed password:', hash);
});

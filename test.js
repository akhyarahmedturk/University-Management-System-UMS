import bcrypt from 'bcrypt';
const pass = "Admin123"
const hash_password = await bcrypt.hash(pass, 10);// salt = 10
console.log(pass);

console.log(hash_password);
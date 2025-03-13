import mangoose from 'mangoose';

const userSchema = new mangoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        
    },
    email :{
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
}, {timestamps: true}
);

const User = mangoose.model('User', userSchema);

export default User;
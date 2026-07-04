import mongoose, { connect } from "mongoose";

const connectDb = async ()=>{
    try {
        console.log("this is mongodb",process.env.MONGOURI);
        const  connetion = await mongoose.connect(`${process.env.MONGOURI}`)
        console.log("the database is connected");
    } catch (error) {
        console.log(`error: ${error}`);
        process.exit(1);
        
    }
}

export default connectDb;
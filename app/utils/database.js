import mongoose from "mongoose"

const connectDB = async() => {
    try {
        await mongoose.connect("mongodb+srv://251018_db_user:013366He@cluster0.tjigmvr.mongodb.net/nextAppDataBase?appName=Cluster0")
        console.log("Syccess:Connected to MongoDB")
    } catch {
        console.log("Faolure:Unconnexted to MongoDB")
        throw new Error()
    }
}

export default connectDB

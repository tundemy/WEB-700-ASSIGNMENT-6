const { Sequelize, DataTypes } = require('sequelize');

// Create a new Sequelize instance
const sequelize = new Sequelize('vstqrilw', 'vstqrilw', 'Ncxg1IHzfwp0pXqkIGFVpH1Y8pP7RZAj', {
    host: 'hansken.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Define the Student model
var Student = sequelize.define('Student', {
    studentNum: { 
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true        
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING
});

var Course = sequelize.define('Course', {
    courseId: { 
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true        
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

Course.hasMany(Student, {foreignKey: 'course'});

//initialise function to read the students.json and courses.js using promise
module.exports.initialize = function(){
    return new Promise(function(resolve, reject){      
        sequelize.sync().then(() => {resolve();})
        .catch(() => {reject("unable to sync the database");})           
    })
}



//creating Promise object for getallstudents function to get all the student objects
module.exports.getAllStudents = function(){
    return new Promise(function(resolve, reject){
        Student.findAll().then(data => {resolve(data);})
        .catch(() => {reject("no results returned");})   
    })
}



//creating Promise object for getCourses function to get all the course objects
module.exports.getCourses = function(){
    return new Promise(function(resolve, reject){
        Course.findAll().then(data => {resolve(data);})
        .catch(() => {reject("no results returned");})
    })
}



//creating Promise object for getStudentsByCourse function to get all the student objects whose course property matches the course parameter 
module.exports.getStudentsByCourse = function(course){
    return new Promise(function(resolve, reject){
        Student.findAll({
            where: {
                course: course
            }
        }).then(data => {resolve(data);})
        .catch(() => {reject("no results returned");})
    })
}



//creating Promise object for getStudentByNum function to get the student object whose num property matches the studentNum parameter 
module.exports.getStudentByNum = function(num){
    return new Promise(function(resolve, reject){
        Student.findAll({
            where: {
                studentNum: num
            }        
        }).then(data => {resolve(data[0]);})
        .catch(() => {reject("no results returned");})   
    })
}  


//creating Promise object for addStudent function
module.exports.addStudent = function(studentData){
    return new Promise(function(resolve, reject){
        studentData.TA = (studentData.TA) ? true : false;
        for (const property in studentData){
            if ((studentData[property] == "") && (property!="TA")){
                studentData[property] = null;
            }
        }

        Student.create({
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            email: studentData.email,
            addressStreet: studentData.addressStreet,
            addressCity: studentData.addressCity,
            addressProvince: studentData.addressProvince,
            TA: studentData.TA,
            status: studentData.status,
            course: studentData.course
        }).then(() => {resolve();})
        .catch(() => {reject("unable to create student");})
    })
}



//creating Promise object for getCourseById function
module.exports.getCourseById = function(id){
    return new Promise(function(resolve, reject){
        Course.findAll({
            where: {
                courseId: id
            }        
        })
        .then(data => {resolve(data[0]);})
        .catch(() => {reject("no results returned");})
    })
}



//creating Promise object for updateStudent function
module.exports.updateStudent = function(studentData){
    return new Promise(function(resolve, reject){
        studentData.TA = (studentData.TA) ? true : false;
        for (const property in studentData){
            if ((studentData[property] == "") && (property!="TA")){
                studentData[property] = null;
            }
        }

        Student.update({
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            email: studentData.email,
            addressStreet: studentData.addressStreet,
            addressCity: studentData.addressCity,
            addressProvince: studentData.addressProvince,
            TA: studentData.TA,
            status: studentData.status,
            course: studentData.course
        }, {
            where: { studentNum: studentData.studentNum }        
        }).then(() => {resolve();})
        .catch(() => {reject("unable to update student");})                    
    })
}



module.exports.addCourse = function(courseData){
    return new Promise(function(resolve, reject){
        for (const property in courseData){
            if (courseData[property] == ""){
                courseData[property] = null;
            }
        }

        Course.create({
            courseCode: courseData.courseCode,
            courseDescription: courseData.courseDescription
        }).then(() => {resolve();})
        .catch(() => {reject("unable to create course");})
    })
}



module.exports.updateCourse = function(courseData){
    return new Promise(function(resolve, reject){
        for (const property in courseData){
            if (courseData[property] == ""){
                courseData[property] = null;
            }
        }

        Course.update({
            courseCode: courseData.courseCode,
            courseDescription: courseData.courseDescription
        }, {
            where: { courseId: courseData.courseId }        
        }).then(() => {resolve();})
        .catch(() => {reject("unable to update course");})                    
    })
}



module.exports.deleteCourseById = function(id){
    return new Promise(function(resolve, reject){        
        Course.destroy({
            where: { courseId: id }        
        }).then(() => {resolve();})
        .catch(() => {reject();})                    
    })
}



module.exports.deleteStudentByNum = function(studentNum){
    return new Promise(function(resolve, reject){        
        Student.destroy({
            where: { studentNum: studentNum }        
        }).then(() => {resolve();})
        .catch(() => {reject();})                    
    })
}
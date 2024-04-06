/*********************************************************************************
*  WEB700 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name:Titilope Orukotan Student ID: 128275237 Date: 03/24/2024
*
********************************************************************************/ 

const collegeData = require("./collegeData");
// server.js

const path = require("path"); //Importing the path Module
const exphbs = require("express-handlebars"); //Importing the express handlebars module

const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();

app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        mailLink: function(options){
            return '<td><a href="mailto:' + options.fn(this) + '">' + options.fn(this) + '</a></td>';
        },
        courseLink: function(courseID,options){
            return '<td><a href="/students?course=' + courseID + '">' + options.fn(this) + '</a></td>';
        },
        studentLink: function(studentNum,options){
            return '<td><a href="/student/' + studentNum + '">' + options.fn(this) + '</a></td>';
        },
        courseIdLink: function(courseID,options){
            return '<td><a href="/course/' + courseID + '">' + options.fn(this) + '</a></td>';
        },
        removeCourse: function(courseID,options){
            return '<td><a href="course/delete/' + courseID + '" class="btn btn-danger">' + options.fn(this) + '</a></td>';
        },
        removeStudent: function(studentNum,options){
            return '<td><a href="student/delete/' + studentNum + '" class="btn btn-danger">' + options.fn(this) + '</a></td>';
        }
    }
}));

app.set('view engine', '.hbs');


app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));    
    next();
});


// setup a 'route' to listen on the url path /students and additionaly to /students?course=value
app.get("/students", (req, res) => {
    
    if (Object.keys(req.query).length == 0){    //checks if the req.query object is empty 
    collegeData.getAllStudents().then(data => {
        if (data.length > 0) {
            res.render("students", {students: data});
        }
        else{
            res.render("students",{ message: "no results" });
        }
        
        })  //use the getAllStudents to get all student objects and sends the json formatted string if successfull
        .catch(() => {res.render("students", {message: "no results"});})  //when the method invokes reject, send the mentioned object back as json
    }

    //use the getStudentsByCourse to get all student objects with course parameter having value as req.query.course and sends the json formatted string if successfull
    else{  
    collegeData.getStudentsByCourse(req.query.course).then(data => {        
        if (data.length > 0) {
            res.render("students", {students: data});
        }
        else{
            res.render("students",{ message: "no results" });
        }

    })
    .catch(() => {res.render("students", {message: "no results"});})    //when the method invokes reject, send the mentioned object back as json
    }  
});


// setup a 'route' to listen on the url path /courses and sends the json formatted string of all courses
app.get("/courses", (req, res) => {        
    collegeData.getCourses().then(data => {
        
        if (data.length > 0) {
            res.render("courses", {courses: data});
        }
        else{
            res.render("courses",{ message: "no results" });
        }
    })
    .catch(() => {res.render("courses", {message: "no results"});})
});


// setup a 'route' to listen on the url path /student/:num and sends the json object of the student whose studentNum parameter holds the value same as num
app.get("/student/:studentNum", (req, res) => {

    // initialize an empty object to store the values
    let viewData = {};

    collegeData.getStudentByNum(req.params.studentNum).then((data) => {
        if (data) {
            viewData.student = data; //store student data in the "viewData" object as "student"
        } else {
            viewData.student = null; // set student to null if none were returned
        }
    }).catch(() => {
        viewData.student = null; // set student to null if there was an error 
    }).then(collegeData.getCourses)
    .then((data) => {
        viewData.courses = data; // store course data in the "viewData" object as "courses"

        // loop through viewData.courses and once we have found the courseId that matches
        // the student's "course" value, add a "selected" property to the matching 
        // viewData.courses object

        for (let i = 0; i < viewData.courses.length; i++) {
            if (viewData.courses[i].courseId == viewData.student.course) {
                viewData.courses[i].selected = true;
            }
        }

    }).catch(() => {
        viewData.courses = []; // set courses to empty if there was an error
    }).then(() => {
        if (viewData.student == null) { // if no student - return an error
            res.status(404).send("Student Not Found");
        } else {
            res.render("student", { viewData: viewData }); // render the "student" view
        }
    });
});


 
// setup a 'route' to listen on the default url path 
app.get("/", (req, res) => {     
    res.render('home');
});


// setup a 'route' to listen on the url path /about
app.get("/about", (req, res) => {     
    res.render('about');
});


// setup a 'route' to listen on the url path /htmlDemo
app.get("/htmlDemo", (req, res) => {     
    res.render('htmlDemo');
});


app.get("/students/add", (req, res) => {   
    collegeData.getCourses().then((data) => {res.render("addStudent", {courses: data});})  
    .catch(() => {res.render("addStudent", {courses: []});})
});


app.get("/courses/add", (req, res) => {     
    res.render('addCourse');
});
    


app.get("/public/css/theme.css", (req, res) => {     
    res.sendFile(path.join(__dirname +'/public/css/theme.css'))
});


//added body parser
app.use(express.urlencoded({ extended: true }));

app.post('/students/add', function (req, res) {
    collegeData.addStudent(req.body).then(()=>{res.redirect('/students')})
    .catch(() => {res.send(JSON.stringify({message:"no results"}) )})
})

app.post('/courses/add', function (req, res) {
    collegeData.addCourse(req.body).then(()=>{res.redirect('/courses')})
    .catch(() => {res.send(JSON.stringify({message:"no results"}) )})
})

app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body).then(()=>{res.redirect('/students')})
});
    

app.post("/course/update", (req, res) => {
    collegeData.updateCourse(req.body).then(()=>{res.redirect('/courses')})
});


app.get("/course/:id", (req, res) => {     
    collegeData.getCourseById(req.params.id).then(data => {
        if (typeof data == "undefined"){
            res.status(404).send("Course Not Found")
        }
        else{
            res.render("course", { course: data });
        }
        
    })
    .catch(() => {res.send(JSON.stringify({message:"no results"}))})
});


app.get("/course/delete/:id", (req, res) => {     
    collegeData.deleteCourseById(req.params.id).then(() => {
        res.redirect('/courses');       
    })
    .catch(() => {res.status(500).send("Unable to Remove Course / Course not found");})
});


app.get("/student/delete/:studentNum", (req, res) => {     
    collegeData.deleteStudentByNum(req.params.studentNum).then(() => {
        res.redirect('/students');       
    })
    .catch(() => {res.status(500).send("Unable to Remove Student / Student not found");})
});
       

// used to add middleware to return page not found message when the user enters a route that is not matched with anything in the app 
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// used to identify "public" folder as a source for static files
app.use(express.static(path.join(__dirname +'/public')));



// checks if initialize method is successfull then setup http server to listen on HTTP_PORT, if initalize method invoked reject error is displayed on console
collegeData.initialize().then(() => {
    app.listen(HTTP_PORT, ()=>{console.log("server listening on port: " + HTTP_PORT)});
})
.catch(error => {console.log(error)});
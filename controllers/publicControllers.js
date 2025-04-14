const organiserDAO = require("../models/organiserModel");
const courseDAO = require("../models/courseModel");
const classDAO = require("../models/classModel")
const { getUserFromToken } = require("../utils/authHelpers");

const courseDB = new courseDAO("courses.db");

const classDB = new classDAO("classes.db");


exports.landing_page = function(req, res) {
  const user = getUserFromToken(req);

  res.render("public/home", {
    title: "Home",
    user: user
  });
};

exports.show_register_page = function(req, res) {
    res.render("organiser/register");
    };

exports.post_new_organiser = function (req, res) {
        const user = req.body.username;
        const password = req.body.pass;
      
        if (!user || !password) {
          res.send(401, "no user or no password");
          return;
        }
        organiserDAO.lookup(user, function (err, u) {
          if (u) {
            res.send(401, "User exists:", user);
            return;
          }
          organiserDAO.create(user, password);
          console.log("register user", user, "password", password);
          res.redirect("/login");
        });
      };

exports.show_login = function (req, res) {
    res.render("organiser/login");
  };

exports.handle_login = function (req, res) {
  res.redirect("/dashboard")
  };

exports.show_courses = function(req, res) {
  const user = getUserFromToken(req);

  courseDB.getAllCourses()
  .then((list) => {
    console.log("Course list:", list);
    res.render("public/courses", {
      title: "All courses",
      user: user,
      courses: list
    });
    console.log("promise succesful");
  })
  .catch((err) => {
    console.log("promise rejected", err);
  });
}

exports.show_classes = function(req, res) {
  const user = getUserFromToken(req);

  classDB.getAllClasses()
    .then((list) => {
      console.log("Class list:", list);
      res.render("public/classes", {
        title: "All Classes",
        user: user,
        classes: list
      });
      console.log("Promise successful");
    })
    .catch((err) => {
      console.log("Promise rejected", err);
    });
};

exports.show_dashboard = function(req, res){
  res.render("organiser/dashboard", {
    title: "Dance Class",
    user: req.user.username
  });
  console.log("req.user is:", req.user);
}

exports.show_courses_with_classes = function(req, res) {
  courseDB.getAllCourses()
    .then((courses) => {
      console.log("Courses fetched:", courses);
      
      const coursePromises = courses.map((course) => {
        console.log("Fetching classes for courseId:", course.courseID); 
        
        return classDB.getClassesByCourseId(course.courseID) 
          .then((classes) => {
            return { ...course, classes };
          });
      });

      Promise.all(coursePromises)
        .then((coursesWithClasses) => {
          console.log("Courses with classes:", coursesWithClasses); // Log final result
          
          res.render("public/courseswithclasses", {
            title: "Courses & Classes",
            courses: coursesWithClasses
          });
        })
        .catch((err) => {
          console.error("Error fetching classes", err);
          res.status(500).send("Internal server error");
        });
    })
    .catch((err) => {
      console.error("Error fetching courses", err);
      res.status(500).send("Internal server error");
    });
};

exports.create_new_class = function (req, res) {
  console.log("processing create_new_class controller");
  try{
    classDB.addClass(req.body.classID, req.body.courseID, req.body.name, req.body.date, req.body.time, req.body.description, req.body.location, req.body.price);
    res.redirect("/classes");
  }
 catch (err) {
  console.error("Error creating new class:", err);
    res.status(500).send("Error creating new class");
}
};

exports.show_new_class_form = function (req, res) {
  const user = getUserFromToken(req);
  res.render('organiser/newclass', {
    title: 'Create New Class',
    user: user
  });
};

exports.delete_class = function (req, res) {
  const classID = req.params.classID;
  classDB.deleteClass(classID)
    .then(() => {
      res.redirect("/classes");
    })
    .catch((err) => {
      console.log("Error deleting class:", err);
      res.status(500).send("Error deleting class");
    });
};

exports.delete_course = function(req, res) {
  const courseID = req.params.courseID;

  // First, delete all classes associated with this course
  classDB.deleteClassesByCourseId(courseID)
    .then(() => {
      // Now, delete the course itself
      courseDB.deleteCourse(courseID)
        .then(() => {
          
          res.redirect("/courses");
        })
        .catch((err) => {
          console.error("Error deleting course:", err);
          res.status(500).send("Error deleting course");
        });
    })
    .catch((err) => {
      console.log("Error deleting classes:", err);
      res.status(500).send("Error deleting associated classes");
    });
};





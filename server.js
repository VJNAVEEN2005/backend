import express from 'express'
import mysql from 'mysql'
import cors from 'cors'
import path from 'path'
import multer from 'multer'







const app = express();
app.use(cors());
app.use(express.json())
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({
    storage: storage
})

// const db = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: 'freelancing',
//     port: 3307
// })

const db = mysql.createConnection({
    host: "bbdhweq0ju8ehndkz1vi-mysql.services.clever-cloud.com",
    user: "uwhpkvwunmdlql6t",
    password: "rrcsBKz0APooe58eH281",
    database: 'bbdhweq0ju8ehndkz1vi',
    port: 3306
})



app.post('/upload/:id', upload.single('image'), (req, res) => {
    const id = req.params.id;
    const image = req.file.filename;
    const sql = "UPDATE users SET ProfilePicture = ? WHERE 	UserID  = ?"
    db.query(sql, [image, id], (err, result) => {
        if (err) return res.json({ Message: "Error" });
        return res.json({ Status: "Success" });
    })
})

app.get('/', (req, res) => {
    const sql = "SELECT * FROM users";
    db.query(sql, (err, result) => {
        if (err) return res.json({ Message: "Error inside server" });
        return res.json(result);
    })
})

app.post('/login', (req, res) => {
    const sql = "SELECT * FROM users WHERE Email = ? AND Password = ?";
    const vlaues = [
        req.body.email,
        req.body.password
    ]
    db.query(sql, vlaues, (err, result) => {
        if (err) return res.json({ Message: "Error inside server" });
        return res.json(result);
    })
})

app.post('/users', (req, res) => {
    const sql = "INSERT INTO users (UserName,Email,Password) VALUES (?)";
    const vlaues = [
        req.body.name,
        req.body.email,
        req.body.password
    ]
    db.query(sql, [vlaues], (err, result) => {
        if (err) return res.json(err);
        return res.json(result);
    })
})

app.get('/profile/:id', (req, res) => {
    const sql = "SELECT * FROM users WHERE UserID = ?";
    const id = req.params.id;

    db.query(sql, [id], (err, result) => {
        if (err) return res.json({ Message: "Error inside server" });
        return res.json(result);
    })
})

app.put('/edit/:id', (req, res) => {
    const id = req.params.id;
    const updatedUser = req.body;

    // Update logic here
    db.query(
        'UPDATE users SET UserName = ?, Details = ?, Country = ?, Email = ?, Phone = ? WHERE 	UserID  = ?',
        [updatedUser.UserName, updatedUser.Details, updatedUser.Country, updatedUser.Email, updatedUser.Phone, id],
        (err, result) => {
            if (err) return res.status(500).send(err);
            res.send({ message: 'User updated successfully!' });
        }
    );
});


// project

app.post('/api/projects', (req, res) => {
    const sql = `
      INSERT INTO Projects (ClientID, Title, Description) 
      VALUES (?, ?, ?)
    `;
    const vlaues = [
        req.body.id,
        req.body.title,
        req.body.description
    ]
    db.query(sql, vlaues, (err, result) => {
        if (err) return res.json({ Message: "Error inside server" });
        return res.json(result);
    })
})

app.get('/projects', (req, res) => {
    const sql = "SELECT * FROM projects JOIN users WHERE projects.ClientID = users.UserID";
    db.query(sql, (err, result) => {
        if (err) return res.json({ Message: "Error inside server" });
        return res.json(result);
    })
})

app.delete('/projects/delete/:projectId', (req, res) => {
    const sql = "DELETE FROM projects WHERE ProjectID = ?";
    const id = req.params.projectId;
    db.query(sql, [id], (err, result) => {
        if (err) return res.json({ Message: "Error inside server" });
        return res.json(result);
    })
})

app.put('/projects/edit/:projectId', (req, res) => {
    const sql = 'UPDATE projects SET ClientID = ?, Title = ?, Description = ? WHERE ProjectID = ?';
    const id = req.params.projectId;  // Correctly referencing projectId from the URL parameter
    db.query(sql, [req.body.clientId, req.body.title, req.body.description, id], (err, result) => {
        if (err) return res.json({ message: "Error inside server" });
        return res.json(result);
    });
});

// rating


app.post('/profile/reviews/:id', (req, res) => {
    const sql = `
        INSERT INTO reviews (FreelancersID, Rating, Feedback, ClientID) 
        VALUES (?, ?, ?, ?)
    `;
    const id = req.params.id; // Assuming FreelancersID is passed as the path parameter
    const values = [
        id,               // FreelancersID
        req.body.rating,  // Rating
        req.body.feedback, // Feedback
        req.body.clientid // ClientID
    ];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.json({ Message: "Error inside server", Error: err });
        }
        return res.json(result);
    });
});

app.get('/reviews/:id', (req, res) => {
    const sql = "SELECT * FROM reviews JOIN users ON reviews.ClientID = users.UserID WHERE reviews.FreelancersID = ?";
    const id = req.params.id;
    db.query(sql, id, (err, result) => {
        if (err) return res.json({ Message: "Error inside server" });
        console.log(result)
        return res.json(result);
    })
})

app.get('/reviews/star/:id', (req, res) => {
    const sql = "SELECT SUM(Rating) DIV COUNT(Rating) AS sum FROM reviews WHERE FreelancersID = ?";
    const id = req.params.id;
    db.query(sql, id, (err, result) => {
        if (err) return res.json({ Message: "Error inside server" });
        console.log(result)
        return res.json(result);
    })
})





app.listen(process.env.X_ZOHO_CATALYST_LISTEN_PORT || 8081, () => {
    console.log("Listening");
})
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
const port = 3005;

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'c237_pharmacyapp'
  });

  connection.connect((err) => {
    if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
    }
    console.log('Connected to MySQL database');
    });

//Include code to set EJS as the view engine
app.set('view engine', 'ejs');

// enable static files
app.use(express.static('public'));

app.use(express.urlencoded({
  extended: false
}));


app.get('/', function(req, res) {
  const sql = 'SELECT * FROM products';
    connection.query(sql , (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving products'); // Render HTML page with data
        }
      res.render('home',{products: results});
    });
});

app.get('/home', function(req, res) {
  const sql = 'SELECT * FROM products';
    connection.query(sql , (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving products'); // Render HTML page with data
        }
  res.render('home',{products: results});
    });
});

// Registration route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
  connection.query(query, [username, hashedPassword], (err, result) => {
      if (err) {
          console.error('Error inserting user into database:', err);
          return res.status(500).send('Server error');
      }
      res.redirect('/');
  });
});

//Order Tracking-view(GET)
app.get('/order_tracking', function(req, res) {
  const sql = 'SELECT * FROM delivery_information';
    connection.query(sql , (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving delivery information'); // Render HTML page with data
        }
  res.render('order_tracking',{delivery_information : results});
    });
});

app.get('/order_tracking/:id', (req, res) => {
  const Tracking_number = req.params.id;
  const sql = 'SELECT * FROM delivery information WHERE Tracking_Number = ?';

  connection.query(sql, [Tracking_number], (error, results) => {
      if (error) {
          console.error('Database query error:', error.message);
          return res.status(500).send('Error Retrieving tracking information by Tracking Number'); // Render HTML page with data
      }
       else {
          res.status(404).send('Tracking Info not found');
      }
  });
});

//Order Schedule-view(GET)
app.get('/schedule', function(req, res) {
  res.render('schedule');
});

//View Products(GET)
app.get('/products', (req, res) => {
  const sql = 'SELECT * FROM products';
    connection.query(sql , (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving products'); // Render HTML page with data
        }
      res.render('products',{products: results});
    });
});

// // Route to get a specific product by ID
// app.get('/products/:id', function(req, res) {
//   // Extracting the 'id' parameter from the request parameters and converting it to an integer
//   const productId = parseInt(req.params.id);
//   // Searching for a student in the 'students' array with a matching 'id'
//   const product = products.find((product) => product.id === productId);

//   // Checking if a student with the specified 'id' was found
//   if (product) {
//       //TODO: If the student is found, render a view called "studentInfo" and pass the variable 'students' to the view for rendering.
//       res.render('productInfo',{product})
//   } 

// });

// Add a new product
app.get('/addProduct', (req, res) => {
  res.render('addProduct');
});

// Add a new product
app.post('/addProduct', (req, res) => {
  const{name, quantity, price, Product_Description,Product_Stocks,image} = req.body;

  const sql = 'INSERT INTO products (productName, quantity, price, Product_Description, Product_Stocks,image) VALUES (?,?,?,?,?,?)';
  connection.query( sql , [name, quantity, price, Product_Description,Product_Stocks,image], (error, results) => {
    if (error) {
        console.error("Error adding product:", error);
        res.status(500).send('Error adding product'); // Render HTML page with data
    } else {
        res.redirect('/products');
    }
  });
});

//Edit
app.get('/editProduct/:id', (req, res) => {
  const productId = req.params.id;
  const sql = 'SELECT * FROM products WHERE productId = ?';
  //Insert the new product into the database
  connection.query( sql , [productId], (error, results) => {
      if (error) {
          console.error("Database query error:", error.message);
          res.status(500).send('Error retrieving product by ID');
      } 
      if(results.length>0){
          res.render('editProduct',{ products: results[0] });
      }
      else {
          res.status(404).send('Tracking info not found');
      }
  });
});  

app.post('/editProduct/:id', (req, res) => {
  const productId = req.params.id;

  const { name, quantity, price, Product_Description,Product_Stocks,image } = req.body;
  const sql = 'UPDATE products SET productName = ? , quantity=?, price=? , Product_Description=?, Product_Stocks=?, image=? WHERE productId = ?';
  //Insert the new product into the database
  connection.query( sql , [name, quantity, price, Product_Description,Product_Stocks,image,productId], (error, results) => {
      if (error) {
          console.error("Error updating product:", error);
          res.status(500).send('Error updating product');
      } 
      else {
          res.redirect('/products');
      }
  });
}); 

//Edit and Update
app.get('/products/:id/update', function(req, res)  {
  //TODO: Insert code to find student to update based on student ID selected
  const productId = parseInt(req.params.id);

  const updateProduct = products.find(function(products){
      return products.id === parseInt(productId);
  });

  res.render('updateProduct', {updateProduct});
});

// Update a product by ID - Update the product information
app.post('/products/:id/update', function(req, res) {
  //TODO: Insert code to update product information entered in updateProduct form
  const productId = parseInt(req.params.id);
  const {productName, quantity, price, description} = req.body;
  const updatedProduct = {id:productId, name:productName, quantity:quantity, price:price, description:description};

  products = products.map(product => {
      if (product.id === productId){
          return{...product, ...updatedProduct};
      }
      return product;
  });
  res.redirect('/');
});

// Delete a products by ID
// Delete product
app.get('/deleteProduct/:id', (req, res) => {
  const productId = req.params.id;
  const sql = 'DELETE FROM products WHERE productId = ?';
  connection.query(sql, [productId], (error, results) => {
      if (error) {
          console.error("Error deleting product:", error);
          res.status(500).send('Error deleting product');
      } else {
          res.redirect('/products');
      }
  });
});

app.get('/order_tracking/:id', (req, res) => {
  const trackingNumber = req.params.id;
  const sql = 'SELECT * FROM delivery_information WHERE Tracking_Number = ?';

  connection.query(sql, [trackingNumber], (error, results) => {
      if (error) {
          console.error('Database query error:', error.message);
          return res.status(500).send('Error retrieving tracking information by Tracking Number');
      }
      if (results.length > 0) {
          console.log('Tracking information found:', results); // Debugging line
          res.render('order_tracking', { delivery_information: results });
      } else {
          console.log('No tracking information found for:', trackingNumber); // Debugging line
          res.status(404).send('Tracking Info not found');
      }
  });
});


// Register route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    connection.query(query, [username, hashedPassword], (err, result) => {
        if (err) {
            console.error('Error inserting user into database:', err);
            return res.status(500).send('Server error');
        }
        res.redirect('/home');
    });
});



// Get Contact
app.get('/contact', function(req, res) {
  //TODO: Insert code to render a view called "index" and pass the variable 'products' to the view for rendering
  res.render('contact');
});


// Start the server and listen on the specified port
app.listen(port, () => {
// Log a message when the server is successfully started
console.log(`Server is running at http://localhost:${port}`);
});


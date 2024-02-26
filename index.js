const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 8000;


// const filePath = 'messages.txt';
// let dataa;
// // Read the contents of the file
// fs.readFile(filePath, 'utf8', (err, data) => {
//     if (err) {
//         console.error('Error reading file:', err);
//         return;
//     }
//     dataa= data
//     // Process the data here
//     console.log('File content:', data);
// });
// Serve the login page
app.get("/user", (req, res) => {
    const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login Form</title>
        </head>
        <body>
            <form id="loginForm" action="/" method="post">
                <input type="text" id="username" placeholder="Username">
                <button type="submit">Login</button>
            </form>
    
            <script>
                // Get the form element
                const form = document.getElementById('loginForm');
    
                // Add event listener for form submission
                form.addEventListener('submit', function(event) {
                    event.preventDefault(); // Prevent default form submission behavior
    
                    // Get input values
                    const username = document.getElementById('username').value;
    
                    // Store data in local storage
                    localStorage.setItem('username', username);
    
                    // Redirect to the message sending form
                    window.location.href = "/";
                });
            </script>
        </body>
        </html>`;
    res.send(html);
});
// Serve the message sending form
app.get("/", (req, res) => {
    fs.readFile(path.join(__dirname, 'messages.txt'), 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading messages file:", err);
            res.status(500).send("Error reading messages.");
        } else {
            const html = `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Send Message</title>
                </head>
                <body>
                <span>${data}</span>
                    <form id="messageForm" action="/message" method="post">
                        <input type="text" id="message" placeholder="Enter your message">
                        <button type="submit">Send</button>
                    </form>
            
                    <script>
                        const username = localStorage.getItem('username');
                        if (username) {
                            const messageForm = document.getElementById('messageForm');
                            messageForm.addEventListener('submit', function(event) {
                                event.preventDefault();
                                const message = document.getElementById('message').value;
                                fetch('/message', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ username, message }),
                                }).then(() => {
                                    // Clear the message input
                                    document.getElementById('message').value = '';
                                    
                                    // Refresh the messages immediately after sending
                                    fetch('/messages')
                                        .then(response => response.json())
                                        .then(messages => {
                                            document.querySelector('span').innerText = messages.join('\\n');
                                        })
                                        .catch(error => console.error('Error:', error));
                                });
                            });
                        } else {
                            // Redirect to login if username not found
                            window.location.href = '/user';
                        }
                    </script>
                </body>
                </html>`;
            res.send(html);
        }
    });
});


// Handle message submission
app.post("/message", express.json(), (req, res) => {
    const { username, message } = req.body;
    if (username && message) {
        const messageData = `${username}: ${message}\n`;
        fs.appendFile(path.join(__dirname, 'messages.txt'), messageData, (err) => {
            if (err) {
                console.error("Error writing message to file:", err);
                res.status(500).send("Error saving message.");
            } else {
                res.status(200).send("Message sent successfully.");
            }
        });
    } else {
        res.status(400).send("Bad request: Missing username or message.");
    }
});

// Serve the chat messages
app.get("/messages", (req, res) => {
    fs.readFile(path.join(__dirname, 'messages.txt'), 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading messages file:", err);
            res.status(500).send("Error reading messages.");
        } else {
            const messages = data.split('\n').filter(Boolean);
            res.json(messages);
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

# PhishGuard 🛡️

### Advanced Anti-Phishing Chrome Extension with Server-Backend Integration

<p align="center">
<img src="./public/images/cyber-security.png" alt="PhishGuard Logo" width="300"/>
</p>

PhishGuard is an intelligent anti-phishing solution designed to protect users from malicious websites. It uses real-time detection methods, monitors user interactions, and employs server-side processing to ensure the highest level of security. Built as a Chrome extension, it seamlessly integrates with a Node.js and MongoDB backend.

## Features ✨

- **Real-Time Phishing Detection**: Detects phishing attempts in real-time using advanced algorithms.
- **Whitelist Monitoring**: Manage and subscribe to custom whitelists for trusted websites.
- **Token-Based Authentication**: Secure user sessions with JWT tokens and Redis-backed token blacklisting for session management.
- **Role-Based Access Control**: Enforce user roles and permissions using middleware.
- **Server-Side Analysis**: Integrated backend system for deep analysis of website behavior.
- **Optimized Project Structure**: Clear separation of concerns with modular code organization for scalability and maintainability.

## Project Structure 🏗️

### Frontend
- **`public/css`**: Stylesheets, including Bootstrap and custom styles.
- **`public/images`**: Icons and assets used within the extension.
- **`public/js`**: Frontend scripts categorized by responsibility (DOM Binding, Utils, etc.).

### Backend
- **`src/features/sites`**: Controllers, models, and utilities related to site monitoring, whitelist management, and cybersecurity features.
- **`src/features/users`**: User management, role-based middleware, authentication utilities (JWT, Redis), and controller logic.
- **`src/features/reports`**: Reports and security analysis models.

### Global Files
- **`config/`**: Global configurations, environment variables.
- **`server.js`**: Main server setup using Express, MongoDB, Redis, and security middleware.

## Installation 🛠️

### Requirements

- Node.js
- MongoDB
- Redis
- Chrome Browser

### Steps

1. **Clone the repository**:  
   `git clone https://github.com/yourusername/phishguard.git`
2. **Install dependencies**:  
   `npm install`
3. **Set up environment variables**:  
   Create a `.env` file based on `.env.example` and configure your `API_URL`, `REDIS_HOST`, `MONGO_URI`, and other variables.
4. **Run the server**:  
   `npm run dev`
5. **Load the Chrome extension**:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `public` folder from the cloned repo

## Usage 🚀

- **Start the backend server**: The backend handles user authentication, whitelist management, and phishing detection.
- **Chrome extension**: Protects you while browsing by checking each visited website against the whitelist and backend analysis.

## Contributing 👩‍💻👨‍💻

PhishGuard is an open-source project. Contributions are welcome! Feel free to fork the repository, make improvements, and submit pull requests.

## License 📜

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact ✉️

If you have any questions or suggestions, feel free to contact me at `amitpom14@gmail.com`.

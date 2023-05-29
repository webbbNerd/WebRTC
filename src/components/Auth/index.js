import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../settings";
import Cookies from "universal-cookie";
import * as Components from "./components";

function LoginPage() {
  const [signIn, toggle] = React.useState(true);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const cookies = new Cookies();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  // Password validation using regex pattern
  const validatePassword = (password) => {
    // At least 6 characters with at least one uppercase letter, one lowercase letter, and one number
    const passwordPattern = /^.{6,12}$/;
    return passwordPattern.test(password);
  };

  const handleSignUp = (event) => {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      return window.alert("All fields are compulsory");
    }
    if (!validateEmail(formData.email)) {
      window.alert("Invalid email");
      return;
    }

    if (!validatePassword(formData.password)) {
      window.alert("Password should 6 to 12 characters long");
      return;
    }
    // Access the values of name, email, and password

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
    };

    fetch(`${api}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response from the server
        if (data.message) {
          window.alert(data.message);
        } else {
          window.alert(data.error);
        }
      })
      .catch((error) => {
        // Handle any errors that occurred during the request
        window.alert(error);
      });
    // Add your sign-up logic here
  };

  const handleSignIn = (event) => {
    event.preventDefault();
    if (!formData.email || !formData.password) {
      return window.alert("All fields are compulsory");
    }

    if (!validateEmail(formData.email)) {
      window.alert("Invalid email");
      return;
    }

    if (!validatePassword(formData.password)) {
      window.alert("Password should 6 to 12 characters long");
      return;
    }
    // Access the values of name, email, and password

    const userData = {
      email: formData.email,
      password: formData.password,
    };

    fetch(`${api}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response from the server
        if (data.message) {
          cookies.set("jwttokenforwebrtc", data.token, {
            path: "/",
            expires: new Date(Date.now() + 25807238),
          });
          navigate("/");
          window.alert(data.message);
        } else {
          window.alert(data.error);
        }
      })
      .catch((error) => {
        // Handle any errors that occurred during the request
        window.alert(error);
      });

    // Add your sign-up logic here
  };

  return (
    <Components.Container>
      <Components.SignUpContainer signinIn={signIn}>
        <Components.Form>
          <Components.Title>Create Account</Components.Title>
          <Components.Input
            type="text"
            placeholder="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
          <Components.Input
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <Components.Input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
          />
          <Components.Button onClick={handleSignUp}>Sign Up</Components.Button>
        </Components.Form>
      </Components.SignUpContainer>

      <Components.SignInContainer signinIn={signIn}>
        <Components.Form>
          <Components.Title>Sign In</Components.Title>
          <Components.Input
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <Components.Input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
          />
          <Components.Anchor href="#">Forgot your password?</Components.Anchor>
          <Components.Button onClick={handleSignIn}>Sign In</Components.Button>
        </Components.Form>
      </Components.SignInContainer>

      <Components.OverlayContainer signinIn={signIn}>
        <Components.Overlay signinIn={signIn}>
          <Components.LeftOverlayPanel signinIn={signIn}>
            <Components.Title>Welcome Back!</Components.Title>
            <Components.Paragraph>
              To keep connected with us please login with your personal info
            </Components.Paragraph>
            <Components.GhostButton onClick={() => toggle(true)}>
              Sign In
            </Components.GhostButton>
          </Components.LeftOverlayPanel>

          <Components.RightOverlayPanel signinIn={signIn}>
            <Components.Title>Hello, Friend!</Components.Title>
            <Components.Paragraph>
              Enter Your personal details and start journey with us
            </Components.Paragraph>
            <Components.GhostButton onClick={() => toggle(false)}>
              Sign Up
            </Components.GhostButton>
          </Components.RightOverlayPanel>
        </Components.Overlay>
      </Components.OverlayContainer>
    </Components.Container>
  );
}

export default LoginPage;

const express = require('express');
const axios = require('axios');

// Make a request to the register endpoint
async function testRegister() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      email: "test1@example.com",
      password: "password123",
      name: "John Doe",
      age: 28,
      gender: "Male"
    });
    console.log('Response:', response.data);
  } catch (error) {
    console.log('Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
    if (error.response?.data) {
      console.log('Error data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testRegister();
import React from 'react';
import '../assets/styles/footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3>ArtGallery</h3>
            <p>Discover and collect unique artworks from talented artists around the world.</p>
            <div className="social-links">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-pinterest"></i></a>
            </div>
          </div>

          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="index.html">Home</a></li>
              <li><a href="artworks.html">Artworks</a></li>
              <li><a href="artists.html">Artists</a></li>
              <li><a href="about.html">About Us</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Customer Service</h3>
            <ul>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Shipping & Returns</a></li>
              <li><a href="#">Payment Options</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Contact Us</h3>
            <ul>
              <li><i className="fas fa-map-marker-alt"></i> 123 Art Street, Gallery District</li>
              <li><i className="fas fa-phone"></i> (123) 456-7890</li>
              <li><i className="fas fa-envelope"></i> info@artgallery.com</li>
            </ul>
          </div>
        </div>
        <div className="copyright">
          <p>&copy; 2023 ArtGallery. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

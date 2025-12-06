import React from 'react';
import '../assets/styles/Home.css';
const Home = () => {
  return (
    <div className='body'>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Discover Unique Artworks</h1>
          <p>Find exceptional pieces from talented artists worldwide</p>
          <div className="search-bar">
            <input type="text" placeholder="Search artworks or artists..." />
            <button><i className="fas fa-search"></i></button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="container">
          <h2>Browse Categories</h2>
          <div className="category-grid">
            {[
              {
                title: "Paintings",
                img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
              },
              {
                title: "Sculptures",
                img: "https://images.unsplash.com/photo-1566438480900-0609be27a4be?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
              },
              {
                title: "Photography",
                img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
              },
              {
                title: "Digital Art",
                img: "https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
              }
            ].map((item, idx) => (
              <div className="category-card" key={idx}>
                <img src={item.img} alt={item.title} />
                <h3>{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="new-arrivals">
        <div className="container">
          <h2>New Arrivals</h2>
          <div className="artwork-grid">
            {[
              {
                title: "Abstract Colors",
                artist: "Maria Rodriguez",
                price: "$450",
                img: "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
              },
              {
                title: "Urban Landscape",
                artist: "James Peterson",
                price: "$320",
                img: "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
              },
              {
                title: "Silent Moment",
                artist: "Sophia Chen",
                price: "$580",
                img: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
              },
              {
                title: "Golden Sunset",
                artist: "David Wilson",
                price: "$390",
                img: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
              }
            ].map((art, idx) => (
              <div className="artwork-item" key={idx}>
                <img src={art.img} alt={art.title} />
                <h3>{art.title}</h3>
                <p className="artist">By {art.artist}</p>
                <p className="price">{art.price}</p>
                <button className="btn view-btn">View Details</button>
              </div>
            ))}
          </div>
          <div className="btn-container">
              <button className="btn more-btn">Explore More</button>
          </div>
        </div>
      </section>

      {/* Top Sellers Section */}
      <section className="top-sellers">
        <div className="container">
          <h2>Top Sellers</h2>
          <div className="artwork-grid">
            {[
              {
                title: "Mountain Dreams",
                artist: "Emma Johnson",
                price: "$520",
                img: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
              },
              {
                title: "Ocean Breeze",
                artist: "Carlos Mendez",
                price: "$480",
                img: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
              },
              {
                title: "Abstract Thoughts",
                artist: "Lisa Wong",
                price: "$670",
                img: "https://images.unsplash.com/photo-1493612276216-ee3925520721?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
              },
              {
                title: "City Lights",
                artist: "Michael Brown",
                price: "$410",
                img: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
              }
            ].map((art, idx) => (
              <div className="artwork-item" key={idx}>
                <img src={art.img} alt={art.title} />
                <h3>{art.title}</h3>
                <p className="artist">By {art.artist}</p>
                <p className="price">{art.price}</p>
                <button className="btn view-btn">View Details</button>
              </div>
            ))}
          </div>
          <div className="btn-container">
            <button className="btn more-btn">View All Sellers</button>
          </div>
        </div>
      </section>

      {/* Featured Artists Section */}
      <section className="featured-artists">
        <div className="container">
          <h2>Featured Artists</h2>
          <div className="artist-grid">
            {[
              {
                name: "Maria Rodriguez",
                role: "Abstract Painter",
                img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
              },
              {
                name: "James Peterson",
                role: "Landscape Photographer",
                img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7"
              },
              {
                name: "Sophia Chen",
                role: "Oil Painter",
                img: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df"
              },
              {
                name: "David Wilson",
                role: "Sculptor",
                img: "https://images.unsplash.com/photo-1566492031773-4f4e44671857"
              }
            ].map((artist, idx) => (
              <div className="artist-card" key={idx}>
                <img src={artist.img} alt={artist.name} />
                <h3>{artist.name}</h3>
                <p>{artist.role}</p>
                <a href="artist-profile.html" className="btn">View Profile</a>
              </div>
            ))}
          </div>
          <div className="btn-container">
            <button className="btn more-btn">Meet More Artists</button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter">
        <div className="container">
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for new arrivals, artist features, and exclusive offers</p>
          <form>
            <input type="email" placeholder="Your email address" />
            <button type="submit" className="btn">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;

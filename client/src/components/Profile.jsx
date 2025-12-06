import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContent } from '../context/AppContext.jsx';
import { toast } from 'react-toastify';

const Profile = () => {
  const { userData, getUserData, backendUrl } = useContext(AppContent);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isSeller, setIsSeller] = useState(false);

  // editable fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileFile, setProfileFile] = useState(null); // file object for profile
  const [profileFilePreview, setProfileFilePreview] = useState(''); // preview URL
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [artworksInterested, setArtworksInterested] = useState([]);
  const [newArtwork, setNewArtwork] = useState('');

  // product add fields (seller)
  const [newProductTitle, setNewProductTitle] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductFile, setNewProductFile] = useState(null);
  const [newProductFilePreview, setNewProductFilePreview] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductCategories, setNewProductCategories] = useState([]); // new: array of categories for this product
  const [newProductCategoryInput, setNewProductCategoryInput] = useState(''); // new: temp input for category

  useEffect(() => {
    if (!userData) return;
    const sellerFlag = userData.role === 'seller';
    setIsSeller(sellerFlag);
    fetchProfile(sellerFlag);
    // eslint-disable-next-line
  }, [userData]);

  const fetchProfile = async (sellerFlag) => {
    setLoading(true);
    try {
      const endpoint = sellerFlag ? 'seller' : 'buyer';
      const res = await axios.get(`${backendUrl}/api/user/${endpoint}`, { withCredentials: true });
      if (res.data.success) {
        const doc = sellerFlag ? res.data.seller : res.data.buyer;
        setProfile(doc);
        setName(doc.name || userData.name || '');
        setEmail(doc.email || userData.email || '');
        setCategories(doc.categories || []);
        setArtworksInterested(doc.artworksInterested || []);
      } else {
        toast.error(res.data.message || 'Could not load profile');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // handle profile file select
  const handleProfileFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      // create preview URL
      const preview = URL.createObjectURL(file);
      setProfileFilePreview(preview);
    }
  };

  // handle product file select
  const handleProductFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProductFile(file);
      const preview = URL.createObjectURL(file);
      setNewProductFilePreview(preview);
    }
  };

  const addCategory = () => {
    const v = newCategory.trim();
    if (!v) return;
    if (!categories.includes(v)) setCategories(prev => [...prev, v]);
    setNewCategory('');
  };

  const removeCategory = (idx) => {
    setCategories(prev => prev.filter((_, i) => i !== idx));
  };

  const addArtwork = () => {
    const v = newArtwork.trim();
    if (!v) return;
    if (!artworksInterested.includes(v)) setArtworksInterested(prev => [...prev, v]);
    setNewArtwork('');
  };

  const removeArtwork = (idx) => {
    setArtworksInterested(prev => prev.filter((_, i) => i !== idx));
  };

  const addProductCategory = () => {
    const v = newProductCategoryInput.trim();
    if (!v) return;
    if (!newProductCategories.includes(v)) setNewProductCategories(prev => [...prev, v]);
    setNewProductCategoryInput('');
  };

  const removeProductCategory = (idx) => {
    setNewProductCategories(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddProduct = async () => {
    if (!newProductTitle || !newProductPrice) {
      toast.error('Title and price required');
      return;
    }
    if (!newProductFile) {
      toast.error('Product image required');
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('title', newProductTitle);
      form.append('price', parseFloat(newProductPrice));
      // use newProductCategories array instead of single category
      form.append('category', newProductCategories.length > 0 ? newProductCategories.join(', ') : newProductCategory);
      form.append('description', newProductDescription);
      form.append('image', newProductFile);

      const res = await axios.post(`${backendUrl}/api/user/seller/products`, form, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('Product added');
        setNewProductTitle('');
        setNewProductPrice('');
        setNewProductCategory('');
        setNewProductDescription('');
        setNewProductFile(null);
        setNewProductFilePreview('');
        setNewProductCategories([]);
        setNewProductCategoryInput('');
        await fetchProfile(true);
      } else {
        toast.error(res.data.message || 'Add product failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Add product failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const endpoint = isSeller ? 'seller' : 'buyer';
      const form = new FormData();
      form.append('name', name);
      form.append('email', email);
      if (profileFile) {
        form.append('profileImage', profileFile);
      }
      if (isSeller) {
        // send as JSON string so server can parse it
        form.append('categories', JSON.stringify(categories));
      } else {
        form.append('artworksInterested', JSON.stringify(artworksInterested));
      }

      const res = await axios.patch(`${backendUrl}/api/user/${endpoint}`, form, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('Profile updated');
        if (getUserData) await getUserData();
        await fetchProfile(isSeller);
        setProfileFile(null);
        setProfileFilePreview('');
      } else {
        toast.error(res.data.message || 'Update failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!productId) return;
    const ok = window.confirm('Delete this product? This action cannot be undone.');
    if (!ok) return;

    try {
      setLoading(true);
      const res = await axios.delete(`${backendUrl}/api/user/seller/products/${productId}`, { withCredentials: true });

      if (res.data.success) {
        toast.success('Product deleted');
        // best: refresh seller profile from server to get canonical state
        await fetchProfile(true);
      } else {
        toast.error(res.data.message || 'Delete failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  // inline styles
  const styles = {
    page: { maxWidth: 920, margin: '28px auto', padding: 20, fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", color: '#0f172a' },
    card: { background: '#ffffff', borderRadius: 12, boxShadow: '0 6px 18px rgba(15,23,42,0.08)', padding: 20 },
    avatar: { width: 96, height: 96, borderRadius: 10, objectFit: 'cover', background: '#eef2ff', border: '2px solid #e6eefb' },
    label: { display: 'block', fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: 600 },
    input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6edf3', outline: 'none', fontSize: 14, color: '#0b1220' },
    chip: { display: 'inline-flex', gap: 8, alignItems: 'center', background: '#f1f5f9', color: '#0b1220', padding: '6px 10px', borderRadius: 20, fontSize: 13 },
    productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginTop: 12 },
    productCard: { borderRadius: 8, overflow: 'hidden', background: '#fff', border: '1px solid #eef2f7', boxShadow: '0 4px 10px rgba(2,6,23,0.03)', padding: 10 },
    productImg: { width: '100%', height: 110, objectFit: 'cover', borderRadius: 6 },
    primaryBtn: { background: '#374151', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 6px 12px rgba(55,65,81,0.08)' },
    secondaryBtn: { background: 'transparent', color: '#374151', border: '1px solid #e6edf3', padding: '9px 12px', borderRadius: 8, cursor: 'pointer' },
    fileInput: { padding: '8px 12px', borderRadius: 8, border: '1px solid #e6edf3', cursor: 'pointer', fontSize: 14 },
    preview: { width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8, marginTop: 8 },
  };

  if (!userData) return <div style={styles.page}><div style={styles.card}>Please login to view profile.</div></div>;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', borderBottom: '1px solid #eef2f7', paddingBottom: 12, marginBottom: 16 }}>
          <img
            src={profileFilePreview || profile?.profilePic || '/placeholder-avatar.png'}
            alt="avatar"
            style={styles.avatar}
            onError={(e) => {
              e.currentTarget.src = '/placeholder-avatar.png';
            }}
          />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0 }}>{userData.name || 'Your profile'}</h2>
            <div style={{ marginTop: 6, display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ color: '#64748b' }}>{userData.email}</span>
              <span style={{ background: '#eef2ff', color: '#0b1220', padding: '4px 8px', borderRadius: 8, fontSize: 13 }}>{userData.role ?? 'buyer'}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label style={styles.label}>Name</label>
              <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label style={styles.label}>Email</label>
              <input style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={styles.label}>Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileFileChange}
              style={styles.fileInput}
            />
            {profileFilePreview && <img src={profileFilePreview} alt="profile preview" style={styles.preview} />}
          </div>

          {isSeller ? (
            <>
              <div style={{ marginTop: 18 }}>
                <h3 style={{ margin: '8px 0' }}>Categories</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  {categories.map((c, idx) => (
                    <div key={idx} style={styles.chip}>
                      <span>{c}</span>
                      <button aria-label={`Remove ${c}`} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16 }} onClick={() => removeCategory(idx)}>✕</button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    style={{ ...styles.input, flex: 1 }}
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Add category (e.g. Abstract)"
                    onKeyPress={(e) => { if (e.key === 'Enter') addCategory(); }}
                  />
                  <button
                    style={{
                      ...styles.primaryBtn,
                      padding: '10px 16px',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={addCategory}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <h3 style={{ margin: '8px 0', marginBottom: 12 }}>Add Product</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12, marginBottom: 12 }}>
                  <input style={styles.input} placeholder="Title" value={newProductTitle} onChange={(e) => setNewProductTitle(e.target.value)} />
                  <input style={styles.input} placeholder="Price" type="number" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={styles.label}>Categories</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    {newProductCategories.map((cat, idx) => (
                      <div key={idx} style={styles.chip}>
                        <span>{cat}</span>
                        <button
                          aria-label={`Remove ${cat}`}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16 }}
                          onClick={() => removeProductCategory(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      style={{ ...styles.input, flex: 1 }}
                      placeholder="Add category (e.g. Abstract, Oil Painting)"
                      value={newProductCategoryInput}
                      onChange={(e) => setNewProductCategoryInput(e.target.value)}
                      onKeyPress={(e) => { if (e.key === 'Enter') addProductCategory(); }}
                    />
                    <button
                      style={{
                        ...styles.primaryBtn,
                        padding: '10px 16px',
                        whiteSpace: 'nowrap',
                      }}
                      onClick={addProductCategory}
                    >
                      Add
                    </button>
                  </div>
                </div>

                <textarea
                  style={{ ...styles.input, width: '100%', minHeight: 80, marginBottom: 12 }}
                  placeholder="Description"
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                />

                <div style={{ marginBottom: 12 }}>
                  <label style={styles.label}>Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProductFileChange}
                    style={styles.fileInput}
                  />
                  {newProductFilePreview && <img src={newProductFilePreview} alt="product preview" style={styles.preview} />}
                </div>

                <button
                  style={styles.primaryBtn}
                  onClick={handleAddProduct}
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Product'}
                </button>
              </div>

              <div style={{ marginTop: 18 }}>
                <h3>Products Added</h3>
                <div style={styles.productGrid}>
                  {(profile?.productsAdded || []).map((p) => (
                    <div key={p._id || p.id} style={{ ...styles.productCard, position: 'relative' }}>
                      <button
                        onClick={() => handleDeleteProduct(p._id || p.id)}
                        title="Delete product"
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          border: 'none',
                          background: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 5,
                        }}
                      >
                        ✕
                      </button>

                      <img src={p.imageUrl || '/placeholder-art.png'} alt={p.title} style={styles.productImg} onError={(e) => e.currentTarget.src = '/placeholder-art.png'} />
                      <div style={{ marginTop: 8, fontWeight: 600, fontSize: 14 }}>{p.title}</div>
                      <div style={{ color: '#64748b', fontSize: 12 }}>{p.category}</div>
                      <div style={{ marginTop: 6, fontWeight: 700, color: '#0f172a' }}>₹{p.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ marginTop: 18 }}>
              <h3>Artworks you're interested in</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {artworksInterested.map((a, idx) => (
                  <div key={idx} style={styles.chip}>
                    <span>{a}</span>
                    <button aria-label={`Remove ${a}`} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16 }} onClick={() => removeArtwork(idx)}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  style={{ ...styles.input, flex: 1 }}
                  value={newArtwork}
                  onChange={(e) => setNewArtwork(e.target.value)}
                  placeholder="Add artwork id or name"
                  onKeyPress={(e) => { if (e.key === 'Enter') addArtwork(); }}
                />
                <button
                  style={{
                    ...styles.primaryBtn,
                    padding: '10px 16px',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={addArtwork}
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
            <button style={styles.primaryBtn} onClick={handleUpdate} disabled={loading}>
              {loading ? 'Updating...' : 'Update'}
            </button>
            <button style={styles.secondaryBtn} onClick={() => { if (getUserData) getUserData(); fetchProfile(isSeller); }}>
              Refresh
            </button>
          </div>

          <div style={{ marginTop: 22 }}>
            <h3>Ordered Products</h3>
            <div style={styles.productGrid}>
              {((isSeller ? profile?.productsOrdered : profile?.productsOrdered) || []).map((p) => (
                <div key={p._id || p.id} style={styles.productCard}>
                  <img src={p.imageUrl || '/placeholder-art.png'} alt={p.title} style={styles.productImg} onError={(e) => e.currentTarget.src = '/placeholder-art.png'} />
                  <div style={{ marginTop: 8, fontWeight: 600, fontSize: 14 }}>{p.title}</div>
                  <div style={{ color: '#64748b', fontSize: 12 }}>{p.category}</div>
                  <div style={{ marginTop: 6, fontWeight: 700, color: '#0f172a' }}>₹{p.price}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 22 }}>
            <h3>Liked Products</h3>
            <div style={styles.productGrid}>
              {((isSeller ? profile?.productsLiked : profile?.productsLiked) || []).map((p) => (
                <div key={p._id || p.id} style={styles.productCard}>
                  <img src={p.imageUrl || '/placeholder-art.png'} alt={p.title} style={styles.productImg} onError={(e) => e.currentTarget.src = '/placeholder-art.png'} />
                  <div style={{ marginTop: 8, fontWeight: 600, fontSize: 14 }}>{p.title}</div>
                  <div style={{ color: '#64748b', fontSize: 12 }}>{p.category}</div>
                  <div style={{ marginTop: 6, fontWeight: 700, color: '#0f172a' }}>₹{p.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
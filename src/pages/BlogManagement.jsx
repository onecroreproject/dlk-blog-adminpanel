import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Upload, Save, ArrowLeft, Image as ImageIcon, Check, Star } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import Cropper from 'react-easy-crop';
import 'react-quill-new/dist/quill.snow.css';
import './BlogManagement.css';

const API_URL = `${import.meta.env.VITE_API_URL}/blogs`;
const BASE_URL = import.meta.env.VITE_API_URL.replace(/\/api$/, '');


const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    author: '',
    content: '',
    isEditorsChoice: false,
  });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [files, setFiles] = useState({
    titleImage: null,
    blogImage1: null,
    blogImage2: null,
    authorAvatar: null,
  });
  const [previews, setPreviews] = useState({
    titleImage: null,
    blogImage1: null,
    blogImage2: null,
    authorAvatar: null,
  });

  // Cropper State
  const [showCropper, setShowCropper] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [cropType, setCropType] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(API_URL);
      setBlogs(res.data);
    } catch (err) {
      console.error('Error fetching blogs:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleEdit = (blog) => {
    setCurrentBlog(blog);
    setFormData({
      title: blog.title,
      category: blog.category,
      author: blog.author,
      content: blog.content,
      isEditorsChoice: blog.isEditorsChoice || false,
    });
    setTags(blog.tags || []);
    setPreviews({
      titleImage: blog.titleImage ? `${BASE_URL}/${blog.titleImage}` : null,
      blogImage1: blog.blogImage1 ? `${BASE_URL}/${blog.blogImage1}` : null,
      blogImage2: blog.blogImage2 ? `${BASE_URL}/${blog.blogImage2}` : null,
      authorAvatar: blog.authorAvatar ? `${BASE_URL}/${blog.authorAvatar}` : null,
    });
    setFiles({ titleImage: null, blogImage1: null, blogImage2: null, authorAvatar: null });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchBlogs();
      } catch (err) {
        console.error('Error deleting blog:', err);
      }
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,/g, '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Image Cropping Helpers
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg');
    });
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setFiles(prev => ({ ...prev, [type]: file }));
        setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
      } else {
        setCropImage(URL.createObjectURL(file));
        setCropType(type);
        setShowCropper(true);
      }
    }
  };

  const handleSaveCrop = async () => {
    try {
      const croppedBlob = await getCroppedImg(cropImage, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], `cropped_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setFiles(prev => ({ ...prev, [cropType]: croppedFile }));
      setPreviews(prev => ({ ...prev, [cropType]: URL.createObjectURL(croppedBlob) }));
      setShowCropper(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = new FormData();
    data.append('author', formData.author);
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('content', formData.content);
    data.append('tags', JSON.stringify(tags));
    data.append('isEditorsChoice', formData.isEditorsChoice);

    if (files.titleImage) data.append('titleImage', files.titleImage);
    if (files.blogImage1) data.append('blogImage1', files.blogImage1);
    if (files.blogImage2) data.append('blogImage2', files.blogImage2);
    if (files.authorAvatar) data.append('authorAvatar', files.authorAvatar);

    try {
      if (currentBlog) {
        await axios.put(`${API_URL}/${currentBlog._id}`, data);
      } else {
        await axios.post(API_URL, data);
      }
      setIsFormOpen(false);
      resetForm();
      fetchBlogs();
    } catch (err) {
      console.error('Error saving blog:', err);
      alert('Failed to save blog');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', category: '', author: '', content: '' });
    setFiles({ titleImage: null, blogImage1: null, blogImage2: null, authorAvatar: null });
    setPreviews({ titleImage: null, blogImage1: null, blogImage2: null, authorAvatar: null });
    setTags([]);
    setTagInput('');
    setCurrentBlog(null);
  };

  return (
    <div className="blog-management" style={{ position: 'relative' }}>
      <div className="page-header">
        <h1 style={{ color: 'black' }}>Blog Management</h1>
        <button className="add-btn" onClick={() => { resetForm(); setIsFormOpen(true); }}>
          <Plus size={20} /> Add New Blog
        </button>
      </div>

      <div className="blog-table-container">
        <table className="blog-table">
          <thead>
            <tr>
              <th style={{ color: 'black' }}>Blog Title</th>
              <th style={{ color: 'black' }}>Author</th>
              <th style={{ color: 'black' }}>Category</th>
              <th style={{ color: 'black' }}>Choice</th>
              <th style={{ color: 'black' }}>Date</th>
              <th style={{ color: 'black' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog._id}>
                <td>
                  <div className="blog-title-cell">
                    <img
                      src={blog.titleImage ? `${BASE_URL}/${blog.titleImage}` : ''}
                      alt=""
                      className="blog-thumb"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                    />
                    <span style={{ color: 'black', fontWeight: 600 }}>{blog.title}</span>
                  </div>
                </td>
                <td style={{ color: 'black' }}>{blog.author}</td>
                <td style={{ color: 'black' }}>{blog.category}</td>
                <td>
                  {blog.isEditorsChoice ? (
                    <Star size={16} fill="#ef4444" color="#ef4444" />
                  ) : (
                    <Star size={16} color="#d1d5db" />
                  )}
                </td>
                <td style={{ color: 'black' }}>{new Date(blog.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="actions">
                    <button className="action-btn edit-btn" onClick={() => handleEdit(blog)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(blog._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="form-page-overlay">
          <div className="form-page-header">
            <button className="back-btn" onClick={() => setIsFormOpen(false)} style={{ color: 'black' }}>
              <ArrowLeft size={20} /> Back
            </button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'black' }}>
              {currentBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h2>
          </div>

          <div className="form-page-content">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label style={{ color: 'black', fontWeight: 800 }}>Title</label>
                  <input
                    type="text"
                    placeholder="Enter blog title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    style={{ color: 'black' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: 'black', fontWeight: 800 }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    style={{ color: 'black' }}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ color: 'black', fontWeight: 800 }}>Author Name</label>
                  <input
                    type="text"
                    placeholder="Enter author name"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                    style={{ color: 'black' }}
                  />
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="isEditorsChoice"
                    checked={formData.isEditorsChoice}
                    onChange={(e) => setFormData({ ...formData, isEditorsChoice: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <label htmlFor="isEditorsChoice" style={{ color: 'black', fontWeight: 800, cursor: 'pointer' }}>Push to Editor's Choice</label>
                </div>

                <div className="form-group">
                  <label style={{ color: 'black', fontWeight: 800 }}>Article Tags</label>
                  <div className="tags-pill-input">
                    <div className="tags-container">
                      {tags.map((tag, i) => (
                        <span key={i} className="tag-pill">
                          {tag} <X size={12} onClick={() => removeTag(tag)} />
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Type and press Enter..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      style={{ color: 'black' }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid">
                {['authorAvatar', 'titleImage', 'blogImage1', 'blogImage2'].map((type) => (
                  <div className="form-group" key={type}>
                    <label style={{ color: 'black', fontWeight: 800, textTransform: 'capitalize' }}>
                      {type.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <div className="image-upload-wrapper">
                      {previews[type] ? (
                        <div className="preview-container">
                          {previews[type].includes('video') ? (
                            <video src={previews[type]} />
                          ) : (
                            <img src={previews[type]} alt="" />
                          )}
                          <div className="preview-overlay">
                            <label htmlFor={type}><Upload size={20} /></label>
                          </div>
                        </div>
                      ) : (
                        <label htmlFor={type} className="upload-placeholder">
                          <Upload size={30} />
                          <span>Upload Media</span>
                        </label>
                      )}
                      <input
                        type="file"
                        id={type}
                        accept="image/*,video/*"
                        onChange={(e) => handleImageChange(e, type)}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="editor-container">
                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 800, color: 'black' }}>Blog Content</label>
                <ReactQuill
                  theme="snow"
                  placeholder="Start writing your blog content here..."
                  value={formData.content}
                  onChange={(val) => setFormData({ ...formData, content: val })}
                  style={{ height: '400px', marginBottom: '3rem', color: 'black' }}
                />
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? 'Processing...' : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Save size={20} />
                    {currentBlog ? 'Update and Publish' : 'Create and Publish'}
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Cropper Modal */}
      {showCropper && (
        <div className="cropper-modal-overlay">
          <div className="cropper-card">
            <div className="cropper-container">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={cropType === 'authorAvatar' ? 1 : 16 / 9}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="cropper-controls">
              <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} />
              <div className="cropper-btns">
                <button className="cancel-btn" onClick={() => setShowCropper(false)}>Cancel</button>
                <button className="save-btn" onClick={handleSaveCrop}><Check size={16} /> Save Crop</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;


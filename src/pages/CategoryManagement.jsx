import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Trash2, Save, Tags, AlertCircle, Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import Cropper from 'react-easy-crop';
import './CategoryManagement.css';

const API_URL = `${import.meta.env.VITE_API_URL}/categories`;
const BASE_URL = import.meta.env.VITE_API_URL.replace(/\/api$/, '');

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [bulkInput, setBulkInput] = useState('');
  const [singleName, setSingleName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Cropper State
  const [showCropper, setShowCropper] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeCategoryForCrop, setActiveCategoryForCrop] = useState(null); // null for new, ID for existing

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(API_URL);
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleFileChange = (e, catId = null) => {
    const file = e.target.files[0];
    if (file) {
      setCropImage(URL.createObjectURL(file));
      setActiveCategoryForCrop(catId);
      setShowCropper(true);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise(resolve => image.onload = resolve);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleSaveCrop = async () => {
    try {
      const croppedBlob = await getCroppedImg(cropImage, croppedAreaPixels);
      const file = new File([croppedBlob], "category.jpg", { type: "image/jpeg" });

      if (activeCategoryForCrop) {
        // Update existing category immediately after crop
        handleUpdate(activeCategoryForCrop, file);
      } else {
        // Set for new category form
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(croppedBlob));
      }
      setShowCropper(false);
      setActiveCategoryForCrop(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSingleAdd = async () => {
    if (!singleName.trim()) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append('name', singleName);
    if (selectedFile) formData.append('image', selectedFile);

    try {
      await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSingleName('');
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkInput.trim()) return;
    setIsLoading(true);
    const names = bulkInput.split('\n').map(name => name.trim()).filter(name => name !== '');
    try {
      await axios.post(API_URL, { names });
      setBulkInput('');
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const handleUpdate = async (id, file = null) => {
    const formData = new FormData();
    if (editValue) formData.append('name', editValue);
    if (file) formData.append('image', file);

    try {
      await axios.put(`${API_URL}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      console.error('Error updating category:', err);
    }
  };

  return (
    <div className="category-management">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#000000', letterSpacing: '-1px' }}>Category Portal</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>Manage your blog's visual categories and organization.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        {/* Single Add Section */}
        <div className="category-card premium">
          <div className="flex items-center gap-3 mb-6">
            <Plus className="text-black" size={28} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#000000' }}>Quick Add</h2>
          </div>

          <div className="form-group mb-6">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: '#888' }}>Category Name</label>
            <input
              type="text"
              placeholder="e.g. Artificial Intelligence"
              className="premium-input"
              value={singleName}
              onChange={(e) => setSingleName(e.target.value)}
            />
          </div>

          <div className="form-group mb-6">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: '#888' }}>Category Visual</label>
            <div className="flex items-center gap-4">
              <div className="image-preview-circle">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" />
                ) : (
                  <ImageIcon size={24} className="text-gray-300" />
                )}
              </div>
              <label className="upload-btn-premium">
                <Upload size={16} /> Choose Image
                <input type="file" hidden onChange={handleFileChange} accept="image/*" />
              </label>
            </div>
          </div>

          <button className="primary-btn-premium" onClick={handleSingleAdd} disabled={isLoading || !singleName.trim()}>
            {isLoading ? 'Creating...' : 'Create Category'}
          </button>
        </div>

        {/* Bulk Add Section */}
        <div className="category-card">
          <div className="flex items-center gap-3 mb-6">
            <Tags className="text-black" size={28} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#000000' }}>Bulk Import</h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
            Perfect for rapid setup. Enter names separated by <strong>new lines</strong>.
          </p>

          <textarea
            placeholder="Web Design&#10;Cloud Computing&#10;Cybersecurity"
            className="premium-textarea"
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
          />
          <button
            className="secondary-btn-premium"
            onClick={handleBulkAdd}
            disabled={isLoading || !bulkInput.trim()}
          >
            {isLoading ? 'Processing...' : 'Bulk Create'}
          </button>
        </div>
      </div>

      <div className="category-table-container premium">
        <table className="category-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Icon</th>
              <th>Category Details</th>
              <th>Created At</th>
              <th style={{ width: '150px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id}>
                <td>
                  <div className="table-image-wrapper">
                    {category.image ? (
                      <img 
                        src={`${BASE_URL}/${category.image}`} 
                        alt="" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=100&auto=format&fit=crop';
                        }}
                      />
                    ) : (
                      <div className="initial-circle">{category.name.charAt(0)}</div>
                    )}
                    <label className="table-image-edit">
                      <Plus size={12} />
                      <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, category._id)} />
                    </label>
                  </div>
                </td>
                <td>
                  {editingId === category._id ? (
                    <div className="flex items-center gap-2">
                      <input
                        className="premium-table-input"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                      />
                      <button className="icon-btn-p save" onClick={() => handleUpdate(category._id)}>
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="category-info-cell">
                      <span
                        className="cat-name-p"
                        onClick={() => { setEditingId(category._id); setEditValue(category.name); }}
                      >
                        {category.name}
                      </span>
                    </div>
                  )}
                </td>
                <td>
                  <span className="date-p">{new Date(category.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </td>
                <td>
                  <div className="actions-cell-p">
                    <button className="icon-btn-p delete" onClick={() => handleDelete(category._id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cropper Modal */}
      {showCropper && (
        <div className="cropper-overlay">
          <div className="cropper-card">
            <div className="cropper-header">
              <h3>Crop Category Image</h3>
              <button onClick={() => setShowCropper(false)}><X /></button>
            </div>
            <div className="cropper-wrapper-p">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="cropper-footer">
              <div className="zoom-slider">
                <span>Zoom</span>
                <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={e => setZoom(e.target.value)} />
              </div>
              <button className="save-crop-btn" onClick={handleSaveCrop}>Save Visual</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;


import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, Heart, ShoppingCart, Zap, Shield, Truck, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Check, X, Users, Award, Phone, Wifi, Camera,
  Battery, Monitor, Cpu, HardDrive, Smartphone, CreditCard, RefreshCw,
  MapPin, Info, Headphones, RotateCcw, FileText, HelpCircle, Gift, Percent,
  Plus, Minus
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import adminService from '../../services/adminService';
import './ProductDetails.css';

const ICON_SIZE = 18;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [pincode, setPincode] = useState('');

  // Single-open accordion key
  const [openKey, setOpenKey] = useState('display');

  // “What is Assured” toggle
  const [showAssured, setShowAssured] = useState(false);

  // Vertical rail ref for smooth scroll
  const railRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await adminService.getBuyProductById(id);
        if (!res?.success) throw new Error('Failed to fetch product details');

        const data = res.data;
        setProduct(data);
        if (data.variants?.length) setSelectedVariant(data.variants[0]);
        if (data.conditionOptions?.length) setSelectedCondition(data.conditionOptions[0]);
        if (data.storageOptions?.length) setSelectedStorage(data.storageOptions[0]);
        if (data.colorOptions?.length) setSelectedColor(data.colorOptions[0]);
      } catch (e) {
        setError(e.message || 'Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const scrollRail = (dir = 1) => {
    const el = railRef.current;
    if (!el) return;
    const step = 88; // thumbnail + gap
    el.scrollBy({ top: step * dir, behavior: 'smooth' });
  };

  const addItem = (goCheckout = false) => {
    if (!product) return;
    addToCart(
      {
        _id: product._id,
        name: product.name,
        price: selectedVariant?.price || product.price,
        images: [product.images?.[0] || '/placeholder-phone.jpg'],
        brand: product.brand || 'Unknown Brand',
        model: product.model || 'Unknown Model',
        condition: selectedCondition,
        inventoryId: product.inventoryId || product._id,
        variant: selectedVariant,
        storage: selectedStorage,
        color: selectedColor
      },
      quantity
    );
    if (goCheckout) navigate('/buy/checkout');
  };

  const renderStars = (rating = 5) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'star-filled' : 'star-empty'}
        fill={i < rating ? '#f59e0b' : 'none'}
      />
    ));

  if (loading) {
    return (
      <div className="pd__shell">
        <div className="pd__loading">
          <div className="pd__spinner" />
          <p>Loading product…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pd__shell">
        <div className="pd__error">
          <X size={28} />
          <h3>Can’t load this product</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            <RefreshCw size={16} />
            <span>Try again</span>
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pd__shell">
        <div className="pd__error">
          <Smartphone size={28} />
          <h3>Product not found</h3>
          <button className="btn" onClick={() => navigate('/buy')}>
            <ChevronLeft size={16} />
            <span>Back to Buy</span>
          </button>
        </div>
      </div>
    );
  }

  const priceNow =
    product.pricing?.discountedPrice || selectedVariant?.price || product.price || 0;
  const mrp = product.pricing?.mrp || product.originalPrice || null;
  const discountPct =
    mrp && priceNow < mrp ? Math.round(((mrp - priceNow) / mrp) * 100) : null;

  return (
    <div className="pd__shell">
      {/* Breadcrumb */}
      <nav className="pd__breadcrumb">
        <button onClick={() => navigate('/')} className="link">Home</button>
        <ChevronRight size={14} />
        <button onClick={() => navigate('/buy')} className="link">Buy</button>
        <ChevronRight size={14} />
        <button
          onClick={() =>
            navigate(`/buy/category/${product?.categoryId?.name || 'Category'}`)
          }
          className="link"
        >
          {product?.categoryId?.name || 'Category'}
        </button>
        <ChevronRight size={14} />
        <span className="muted">{product.name}</span>
      </nav>

      {/* Top area */}
      <section className="pd__top">
        {/* Gallery with left rail like Cashify */}
        <div className="pd__gallery card">
          <div className="pd__rail">
            <button className="rail-btn" onClick={() => scrollRail(-1)} aria-label="Scroll up">
              <ChevronUp size={16} />
            </button>
            <div className="rail-list" ref={railRef}>
              {(() => {
                // Handle images as object with main, gallery, thumbnail properties
                const imageArray = [];
                if (product.images) {
                  if (product.images.main) imageArray.push(product.images.main.trim());
                  if (product.images.gallery) imageArray.push(product.images.gallery.trim());
                  if (product.images.thumbnail && product.images.thumbnail !== product.images.gallery) {
                    imageArray.push(product.images.thumbnail.trim());
                  }
                }
                // Fallback to placeholder if no images
                const finalImages = imageArray.length > 0 ? imageArray : ['/placeholder-phone.jpg'];
                
                return finalImages.map((img, i) => (
                  <button
                    key={i}
                    className={`rail-thumb ${i === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(i)}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} />
                  </button>
                ));
              })()}
            </div>
            <button className="rail-btn" onClick={() => scrollRail(1)} aria-label="Scroll down">
              <ChevronDown size={16} />
            </button>
          </div>

          <div className="pd__gallery-main">
            <img
              src={(() => {
                // Handle images as object with main, gallery, thumbnail properties
                const imageArray = [];
                if (product.images) {
                  if (product.images.main) imageArray.push(product.images.main.trim());
                  if (product.images.gallery) imageArray.push(product.images.gallery.trim());
                  if (product.images.thumbnail && product.images.thumbnail !== product.images.gallery) {
                    imageArray.push(product.images.thumbnail.trim());
                  }
                }
                // Fallback to placeholder if no images
                const finalImages = imageArray.length > 0 ? imageArray : ['/placeholder-phone.jpg'];
                return finalImages[selectedImageIndex] || '/placeholder-phone.jpg';
              })()}
              alt={product.name}
            />
            <div className="pd__assured">
              <Shield size={14} />
              Cashify Assured
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="pd__info">
          <div className="pd__title-row">
            <div className="pd__chips">
              {product.isRefurbished && <span className="chip chip-green">Refurbished</span>}
              <span className="chip">32-Point QC</span>
              <span className="chip">15-Day Refund</span>
              <span className="chip">12-Month Warranty</span>
            </div>
            <h1 className="pd__title">
              {product.name} <span className="muted">– Refurbished</span>
            </h1>
            <div className="pd__rating">
              <div className="stars">{renderStars(Math.round(product.averageRating || 5))}</div>
              <span className="pd__rating-val">{product.averageRating || '5.0'}</span>
              <span className="dot" />
              <span className="muted">{product.totalReviews || 4} reviews</span>
              <span className="dot" />
              <span className="muted">
                {product.trustMetrics?.devicesSold || product.soldCount || '500+'} sold
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="pd__price card">
            <div className="pd__price-left">
              {discountPct ? <span className="red">-{discountPct}%</span> : null}
              <div className="now">₹{priceNow.toLocaleString()}</div>
              {mrp ? <div className="mrp">₹{mrp.toLocaleString()}</div> : null}
            </div>
            <div className="pd__price-right">
              {product.paymentOptions?.emiAvailable && (
                <div className="irow">
                  <CreditCard size={ICON_SIZE} />
                  <span>EMI from ₹{Math.round(priceNow / 12).toLocaleString()}/mo</span>
                  <button className="link-sm">View Plans</button>
                </div>
              )}
              <div className="irow">
                <Gift size={ICON_SIZE} />
                <span>
                  You save ₹{mrp && mrp > priceNow ? (mrp - priceNow).toLocaleString() : 0}
                </span>
              </div>
            </div>
          </div>

          {/* Trust strip */}
          <div className="pd__trust">
            <div className="trust-item irow"><Shield size={ICON_SIZE} />32-Point Quality Check</div>
            <div className="trust-item irow"><RotateCcw size={ICON_SIZE} />15-Day Refund</div>
            <div className="trust-item irow"><Award size={ICON_SIZE} />12-Month Warranty</div>
          </div>

          {/* What is Assured */}
          <div className="pd__accordion card">
            <button className="acc__head" onClick={() => setShowAssured((v) => !v)}>
              <div className="irow"><Info size={ICON_SIZE} />What is Cashify Assured?</div>
              {showAssured ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showAssured && (
              <div className="acc__body">
                <p>Fully tested, verified devices with secure payment, easy returns and warranty.</p>
                <ul className="list-ticks">
                  <li>Authentic & verified</li>
                  <li>32-point QC</li>
                  <li>Hassle-free returns</li>
                </ul>
              </div>
            )}
          </div>

          {/* Condition / Storage / Color */}
          {product.conditionOptions?.length ? (
            <div className="pd__picker">
              <h4>Condition</h4>
              <div className="pill-row">
                {product.conditionOptions.map((c, i) => {
                  const active = selectedCondition?.label === c.label;
                  return (
                    <button
                      key={c._id || i}
                      className={`pill ${active ? 'active' : ''}`}
                      onClick={() => setSelectedCondition(c)}
                    >
                      <span className="bold">{c.label}</span>
                      <span className="muted">₹{c.price?.toLocaleString()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {product.storageOptions?.length ? (
            <div className="pd__picker">
              <h4>Storage</h4>
              <div className="pill-row">
                {product.storageOptions.map((s, i) => {
                  const active = selectedStorage?.size === s.size;
                  return (
                    <button
                      key={i}
                      className={`pill ${active ? 'active' : ''}`}
                      onClick={() => setSelectedStorage(s)}
                    >
                      {s.size}
                      {!!s.additionalPrice && (
                        <span className="muted"> +₹{s.additionalPrice.toLocaleString()}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {product.colorOptions?.length ? (
            <div className="pd__picker">
              <h4>Color</h4>
              <div className="color-row">
                {product.colorOptions.map((c, i) => {
                  const active = selectedColor?.name === c.name;
                  return (
                    <button
                      key={i}
                      className={`color ${active ? 'active' : ''}`}
                      title={c.name}
                      style={{ backgroundColor: c.hex }}
                      onClick={() => setSelectedColor(c)}
                    >
                      {active && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Quantity + Actions */}
          <div className="pd__actions card">
            <div className="qty">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}>
                <Minus size={16} />
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)}>
                <Plus size={16} />
              </button>
            </div>
            <div className="act">
              <button
                className={`btn icon ${isWishlisted ? 'wish' : ''}`}
                onClick={() => setIsWishlisted((v) => !v)}
                aria-label="Wishlist"
              >
                <Heart size={18} fill={isWishlisted ? '#10b981' : 'none'} />
              </button>
              <button className="btn" onClick={() => addItem(false)}>
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </button>
              <button className="btn btn-primary" onClick={() => addItem(true)}>
                <Zap size={18} />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Delivery */}
          <div className="pd__delivery card">
            <div className="row irow">
              <Truck size={ICON_SIZE} />
              <div>
                <div className="bold">
                  {product.availability?.inStock ? 'Free Delivery' : 'Out of Stock'}
                </div>
                <div className="muted">
                  {product.availability?.estimatedDelivery || 'Delivered in 2-3 business days'}
                </div>
              </div>
            </div>
            <div className="row irow">
              <MapPin size={ICON_SIZE} />
              <div className="pincode">
                <span className="bold">Check delivery to your pincode</span>
                <div className="pin">
                  <input
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter pincode"
                  />
                  <button className="btn-sm">Check</button>
                </div>
              </div>
            </div>
            <div className="row irow"><RotateCcw size={ICON_SIZE} /><div><div className="bold">15-Day Refund</div><div className="muted">Easy returns & exchanges</div></div></div>
            <div className="row irow"><Shield size={ICON_SIZE} /><div><div className="bold">Secure Packaging</div><div className="muted">Safe & secure delivery</div></div></div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="pd__tabs card">
        <div className="pd__tabbar">
          <button className={activeTab === 'specs' ? 'active' : ''} onClick={() => setActiveTab('specs')}>
            <FileText size={16} /> Specifications
          </button>
          <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>
            <Star size={16} /> Reviews ({product.totalReviews || 4})
          </button>
          <button className={activeTab === 'warranty' ? 'active' : ''} onClick={() => setActiveTab('warranty')}>
            <Shield size={16} /> Warranty
          </button>
          <button className={activeTab === 'offers' ? 'active' : ''} onClick={() => setActiveTab('offers')}>
            <Gift size={16} /> Offers
          </button>
          <button className={activeTab === 'faq' ? 'active' : ''} onClick={() => setActiveTab('faq')}>
            <HelpCircle size={16} /> FAQ
          </button>
        </div>

        {/* CONTENT */}
        {activeTab === 'specs' && (
          <div className="pd__specs">
            {/* Top specs */}
            <div className="pd__topspecs">
              <SpecTile icon={<Monitor size={ICON_SIZE} />} label="Screen Size" value={product.productDetails?.display?.size || product.topSpecs?.screenSize || '6.7 inches'} />
              <SpecTile icon={<Cpu size={ICON_SIZE} />} label="Chipset" value={product.productDetails?.performance?.chipset || product.topSpecs?.chipset || 'Google Tensor G3'} />
              <SpecTile icon={<HardDrive size={ICON_SIZE} />} label="Pixel Density" value={product.topSpecs?.pixelDensity || '490 ppi'} />
              <SpecTile icon={<Smartphone size={ICON_SIZE} />} label="Network" value={product.productDetails?.networkConnectivity?.networkSupport || product.topSpecs?.networkSupport || '5G'} />
              <SpecTile icon={<Smartphone size={ICON_SIZE} />} label="SIM Slots" value={product.productDetails?.networkConnectivity?.simSlots || product.topSpecs?.simSlots || 'Dual SIM, GSM+GSM'} />
            </div>

            {/* Accordions (single-open) */}
            <Acc
              label="Display"
              icon={<Monitor size={ICON_SIZE} />}
              open={openKey === 'display'}
              onToggle={() => setOpenKey(openKey === 'display' ? '' : 'display')}
              rows={[
                ['Screen Size', product.productDetails?.display?.size || '6.7 inches'],
                ['Type', product.productDetails?.display?.technology || 'LTPO OLED'],
                ['Resolution', product.productDetails?.display?.resolution || '2992 × 1344'],
                ['Refresh Rate', product.productDetails?.display?.refreshRate || '120Hz'],
                ['Peak Brightness', product.topSpecs?.pixelDensity || '2400 nits peak']
              ]}
            />
            <Acc
              label="Performance"
              icon={<Cpu size={ICON_SIZE} />}
              open={openKey === 'performance'}
              onToggle={() => setOpenKey(openKey === 'performance' ? '' : 'performance')}
              rows={[
                ['Chipset', product.productDetails?.performance?.chipset || 'Google Tensor G3'],
                ['GPU', product.productDetails?.performance?.gpu || 'Immortalis-G715s MC10'],
                ['OS', product.productDetails?.performance?.os || 'Android 14'],
                ['Architecture', product.productDetails?.performance?.architecture || 'ARM64'],
                ['RAM Type', product.productDetails?.memoryStorage?.ramType || 'LPDDR5X'],
                ['Storage Type', product.productDetails?.memoryStorage?.romType || 'UFS 3.1']
              ]}
            />
            <Acc
              label="Camera"
              icon={<Camera size={ICON_SIZE} />}
              open={openKey === 'camera'}
              onToggle={() => setOpenKey(openKey === 'camera' ? '' : 'camera')}
              rows={[
                ['Rear Setup', product.productDetails?.rearCamera?.setup || '50MP OIS + 48MP + 48MP'],
                ['Front', product.productDetails?.frontCamera?.resolution || '10.5MP'],
                ['Video', product.productDetails?.rearCamera?.videoRecording?.join(', ') || '4K60, 1080p240'],
                ['Flash', product.productDetails?.rearCamera?.flash || 'LED']
              ]}
            />
            <Acc
              label="Battery & Charging"
              icon={<Battery size={ICON_SIZE} />}
              open={openKey === 'battery'}
              onToggle={() => setOpenKey(openKey === 'battery' ? '' : 'battery')}
              rows={[
                ['Capacity', product.productDetails?.battery?.capacity || '5000 mAh'],
                ['Fast Charging', product.productDetails?.battery?.fastCharging || '30W'],
                ['Wireless', product.productDetails?.battery?.wirelessCharging || '23W']
              ]}
            />
            <Acc
              label="Connectivity"
              icon={<Wifi size={ICON_SIZE} />}
              open={openKey === 'connectivity'}
              onToggle={() => setOpenKey(openKey === 'connectivity' ? '' : 'connectivity')}
              rows={[
                ['Network', product.productDetails?.networkConnectivity?.networkSupport || '5G / 4G'],
                ['Wi-Fi', product.productDetails?.networkConnectivity?.wifi || 'Wi-Fi 6E'],
                ['Bluetooth', product.productDetails?.networkConnectivity?.bluetooth || '5.3'],
                ['NFC', product.productDetails?.networkConnectivity?.nfc ? 'Yes' : 'No'],
                ['GPS', product.productDetails?.networkConnectivity?.gps || 'GPS, GLONASS, Galileo'],
                ['SIM Slots', product.productDetails?.networkConnectivity?.simSlots || 'Dual SIM']
              ]}
            />
            <Acc
              label="Design & Build"
              icon={<Smartphone size={ICON_SIZE} />}
              open={openKey === 'design'}
              onToggle={() => setOpenKey(openKey === 'design' ? '' : 'design')}
              rows={[
                ['Weight', product.productDetails?.design?.weight || '210 g'],
                ['Build', product.productDetails?.design?.build || 'Aluminum, Gorilla Glass Victus 2'],
                ['Colors', (product.productDetails?.design?.colors || ['Obsidian', 'Porcelain', 'Bay']).join(', ')],
                ['Fingerprint', product.productDetails?.sensorsMisc?.fingerprintScanner ? 'Yes' : 'No']
              ]}
            />
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="pd__reviews">
            <div className="summary">
              <div className="score">
                <div className="big">{product.averageRating || '5.0'}</div>
                <div className="stars big">{renderStars(Math.round(product.averageRating || 5))}</div>
                <div className="muted">out of 5</div>
              </div>
            </div>

            <div className="review">
              <div className="head">
                <div className="avatar">A</div>
                <div className="meta">
                  <div className="name">Anonymous</div>
                  <div className="muted">3/5/2025</div>
                </div>
                <div className="stars">{renderStars(5)}</div>
              </div>
              <p>new vs refurb mob</p>
            </div>

            <div className="review">
              <div className="head">
                <div className="avatar">A</div>
                <div className="meta">
                  <div className="name">Anonymous</div>
                  <div className="muted">27/4/2025</div>
                </div>
                <div className="stars">{renderStars(5)}</div>
              </div>
              <p>Excellent phone! Premium build and great cameras. Highly recommended.</p>
            </div>
          </div>
        )}

        {activeTab === 'warranty' && (
          <div className="pd__warranty">
            <div className="grid3">
              <div className="wcard irow"><Shield size={22} /><div><h4>12-Month Warranty</h4><p>Hardware defects covered</p></div></div>
              <div className="wcard irow"><Headphones size={22} /><div><h4>24/7 Support</h4><p>We’re here any time</p></div></div>
              <div className="wcard irow"><RotateCcw size={22} /><div><h4>15-Day Refund</h4><p>No-hassle returns</p></div></div>
            </div>
            <div className="acc">
              <div className="acc__head static"><span>Coverage</span></div>
              <div className="acc__body list-cols">
                <ul className="list-ticks">
                  <li>Hardware defects & malfunctions</li>
                  <li>Battery performance issues</li>
                  <li>Display / camera faults</li>
                </ul>
                <ul className="list-cross">
                  <li>Physical / water damage</li>
                  <li>Unauthorized repairs</li>
                  <li>Normal wear & tear</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="pd__offers">
            <Offer icon={<Percent size={20} />} title="Bank Offer" desc="10% instant discount up to ₹2,000 on select cards" />
            <Offer icon={<CreditCard size={20} />} title="No-Cost EMI" desc="Available on major credit/debit cards" />
            <Offer icon={<Gift size={20} />} title="Exchange Bonus" desc="Get extra value for your old smartphone" />
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="pd__faq">
            <FaqItem
              open={openKey === 'faq1'}
              onToggle={() => setOpenKey(openKey === 'faq1' ? '' : 'faq1')}
              q='What does “Superb” condition mean?'
              a='Minor body marks, flawless screen, fully functional & QC-passed.'
            />
            <FaqItem
              open={openKey === 'faq2'}
              onToggle={() => setOpenKey(openKey === 'faq2' ? '' : 'faq2')}
              q='Is the warranty transferable?'
              a='Yes — remaining warranty follows the device with the original invoice.'
            />
            <FaqItem
              open={openKey === 'faq3'}
              onToggle={() => setOpenKey(openKey === 'faq3' ? '' : 'faq3')}
              q='What’s in the box?'
              a='Phone, compatible USB cable and docs. Adapters may vary by availability.'
            />

            <div className="support-callout">
              <h4>Still have questions?</h4>
              <div className="row">
                <button className="btn-sm"><Phone size={16} /> Call Support</button>
                <button className="btn-sm"><HelpCircle size={16} /> Live Chat</button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Description */}
      {product.description && (
        <section className="pd__desc card">
          <h3>About this product</h3>
          <p>{product.description}</p>
        </section>
      )}
    </div>
  );
};

/* Helper subcomponents (UI only) */
const SpecTile = ({ icon, label, value }) => (
  <div className="ts">
    <div className="ico">{icon}</div>
    <div className="txt">
      <div className="label">{label}</div>
      <div className="val">{value}</div>
    </div>
  </div>
);

const Acc = ({ label, icon, open, onToggle, rows }) => (
  <div className="acc">
    <button className="acc__head" onClick={onToggle}>
      <div className="irow">{icon}<span>{label}</span></div>
      {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
    {open && (
      <div className="kv-table">
        {rows.map(([k, v], i) => (
          <div className="kv-row" key={i}>
            <div className="k">{k}</div>
            <div className="v">{v}</div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const Offer = ({ icon, title, desc }) => (
  <div className="offer">
    <div className="ico">{icon}</div>
    <div className="txt">
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  </div>
);

const FaqItem = ({ q, a, open, onToggle }) => (
  <div className="acc">
    <button className="acc__head" onClick={onToggle}>
      <span>{q}</span>
      {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
    {open && <div className="acc__body">{a}</div>}
  </div>
);

export default ProductDetails;

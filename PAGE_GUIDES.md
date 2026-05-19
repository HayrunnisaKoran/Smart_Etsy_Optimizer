# 🎯 Sayfa Rehberleri - Detaylı İşlem Adımları

**Smart Etsy Optimizer - Her Sayfanın Özel Kılavuzu**

---

## 📊 1. Dashboard (Ana Sayfa)

### Amacı
Mağazanızın anlık durumunu görmek. Satış trendi, envanter değeri ve son siparişler tek ekranda.

### Veri Kaynağı
- **Siparişler:** Firestore `orders` koleksiyonundan
- **Ürünler:** Firestore `products` koleksiyonundan
- **Grafikler:** Dinamik veya (mock data - geliştirilecek)

### Adım Adım İşlem

#### 1.1. Sayfayı Açtığınızda
```
1. Otomatik veri yüklenir (API.get('/products') + API.get('/orders'))
2. Üstteki 4 kart hesaplanır
3. Grafik çizilir
4. Son 5 sipariş tabloya eklenir
```

#### 1.2. Özet Kartlarını Anlamak
```
💰 TOPLAM SATIŞLAR ($)
├─ Hesap: SUM(tüm orders.amount)
├─ Örnek: $450 + $320 + $285 = $1,055
└─ Açıklama: Tamamlanan tüm siparişlerin toplamı

📦 SATILAN ÜRÜN (ADET)
├─ Hesap: SUM(tüm orders.itemCount)
├─ Örnek: 2 + 1 + 3 = 6 adet
└─ Açıklama: Tüm sipariş satırlarındaki ürün adedi

🏭 ENVANTER DEĞERİ ($)
├─ Hesap: SUM(her ürün için: stock × price)
├─ Örnek: (12×$45.99) + (5×$32.50) + (8×$28.99)
└─ Açıklama: Deponuzdaki ürünlerin toplam parası

📈 AYLIK BÜYÜME (%)
├─ Hesap: (Bu ay satışı - Geçen ay satışı) / Geçen ay satışı × 100
├─ Örnek: ($1,055 - $940) / $940 × 100 = 12.2%
└─ Açıklama: Satışlardaki artış yüzdesi
```

#### 1.3. Satış Grafiğini Okumak
```
Y Ekseni: Satış Miktarı ($)
X Ekseni: Haftanın Günleri
├─ Pzt (Pazartesi)
├─ Salı
├─ Çrş (Çarşamba)
├─ Prş (Perşembe)
├─ Cum (Cuma)
├─ Cmt (Cumartesi)
└─ Paz (Pazar)

Mavi Çizgi: Bu Hafta Satışları
Gri Çizgi: Geçen Hafta Satışları (Trend Karşılaştırması)

Örnek Okuma:
"Pazartesi: $1,200"  ← Pazartesi günü satış
"Pazar: $2,800"      ← Pazar günü en yüksek satış
"Trend Artıyor"      ← Hafta boyunca kademeli artış
```

#### 1.4. Periyot Değiştirme (Grafik Türü)
```
[Daily] [Weekly] [Monthly]

● Daily:    Saatlik veriler (7 saat)
● Weekly:   Haftalık toplam (4 hafta)
● Monthly:  Aylık toplam (12 ay)

Seçim yapınca: Grafik otomatik güncellenir
```

#### 1.5. Son Siparişler Tablosu

**Tablo Açıklaması:**
```
┌─────────────┬────────┬───────────────┬────────┐
│ Müşteri     │ Tutar  │ Durum         │ Saat   │
├─────────────┼────────┼───────────────┼────────┤
│ John Smith  │ $450   │ ✓ Completed   │ 14:25  │
│ Sarah J.    │ $320.50│ ✓ Completed   │ 13:10  │
│ Mike Davis  │ $285.75│ ⚙ Processing  │ 11:45  │
└─────────────┴────────┴───────────────┴────────┘

Veri Kaynağı: orders koleksiyonundan çekilir
Sıralama: En yeni siparişler en üstte
Gösterilen: Son 5 sipariş
```

#### 1.6. Yeni Ürün Ekleme İşlemi

**Buton Konumu:** Sağ üst köşede "+ Yeni Ürün Ekle"

**Form Doldurma:**
```
Adım 1: "+ Yeni Ürün Ekle" tıkla
        ↓
Adım 2: Modal açılır
        ┌──────────────────────────────┐
        │ Ürün Ekle                    │
        ├──────────────────────────────┤
        │ Ürün Adı:  [Handmade Mug___] │
        │ SKU:       [HCM-005________] │
        │ Stok:      [12_____________] │
        │ Fiyat:     [$45.99________]  │
        │            [İptal] [Ekle]    │
        └──────────────────────────────┘
        
Adım 3: Bilgileri doldur
        - Adı: Etsy'de gösterilecek tam isim
        - SKU: Boşluksuz kod (örn: HCM-005)
        - Stok: Sayı olarak mevcut miktar
        - Fiyat: Dolar cinsinden
        
Adım 4: "Ekle" tıkla
        ↓
Adım 5: API.post('/products', {...})
        Firestore'a kaydedilir
        ↓
Adım 6: Modal kapanır, sayfa yenilenir
```

**Validasyon Kuralları:**
- Ürün Adı: Boş olamaz
- SKU: Benzersiz olmalı
- Stok: Sayı olmalı (≥0)
- Fiyat: Sayı olmalı (≥0)

#### 1.7. Veri Senkronizasyon (Refresh)

**Etsy API Çekimi Süreci:**
```
[🔄 Verileri Yenille] butonuna tıkla
         ↓
1. handleRefresh() çalışır
         ↓
2. API.get('/etsy/sales/fetch?startDate=2026-05-01&endDate=2026-05-30')
   └─ Backend services/etsyService.js'deki fetchEtsySalesData() çalışır
   └─ Mock veritabanından tarih filtrelenmiş satışlar döner
         ↓
3. Alınan her satış için:
   - API.post('/orders', {...})
   - Firestore orders koleksiyonuna yeni sipariş eklenir
         ↓
4. Stok güncelleme:
   - API.post('/etsy/inventory/update', [...])
   - Backend updateEtsyInventory() çalışır
   - Firestore'da ürün stokları azaltılır
         ↓
5. API logları gösterilir:
   ├─ "Etsy'den Satış Çekildi: SKU HCM-005, 1 Adet"
   ├─ "Stok Entegrasyonu: SKU HCM-005 -> 11 adet"
   └─ "Başarılı! ✓"
         ↓
6. Dashboard sayısı güncellenir
```

**Senkronizasyon Parametreleri:**
- Başlangıç Tarihi: 2026-05-01 (mock data'da)
- Bitiş Tarihi: 2026-05-30
- Filtre: Bu tarih aralığında olan satışlar çekilir

**Mock Veriler (Backend'deki):**
```javascript
const mockDatabase = [
    { transactionId: "ETSY-TX-88101", sku: "HCM-005", quantitySold: 1, date: 2026-05-10 },
    { transactionId: "ETSY-TX-88102", sku: "SMR-012", quantitySold: 2, date: 2026-05-17 },
    { transactionId: "ETSY-TX-88103", sku: "BMW-002", quantitySold: 1, date: 2026-05-25 },
    // Tarih aralığında olan bunlar döner
];
```

---

## 🏷️ 2. Ürünler Sayfası

### Amacı
Tüm ürünlerinizi listeleme, arama, düzenleme, silme

### Veri Kaynağı
- **Firestore `products` koleksiyonundan** gerçek zamanlı

### Adım Adım İşlem

#### 2.1. Ürün Listesini Yükleme

```
Sayfa açılır
    ↓
useEffect() tetiklenir
    ↓
fetchProducts() çalışır:
  API.get('/products')
    ↓
Backend'den JSON döner:
[
  {
    id: "doc1",
    name: "Handmade Mug",
    sku: "HCM-005",
    stock: 12,
    price: 45.99,
    category: "Home Decor",
    createdAt: {_seconds: 1715...}
  },
  { ... },
  { ... }
]
    ↓
Veriler temizlenir (null, NaN kontrol)
    ↓
Tarih sırasına göre sıralanır (En yeni en üstte)
    ↓
state'e kaydedilir: setProducts(...)
    ↓
Sayfada görüntülenir
```

#### 2.2. Arama İşlemi

```
[Ara ürün adı veya SKU...]
         ↓
Yazım başladığında:
- Ürün ismi kontrol: "Handmade".includes("hand") = true ✓
- SKU kontrol: "HCM-005".includes("hand") = false
- Sonuç: Görüntüle
         ↓
Örekler:
- "Hand" yazarsanız → "Handmade Mug" bulunur
- "HCM" yazarsanız → "HCM-005" bulunur
- "005" yazarsanız → "HCM-005" bulunur
```

#### 2.3. Kategori Filtreleme

```
[All Categories ▼] dropdown'ı

Dinamik Kategoriler (Products'tan çekilir):
- All Categories (Hepsi göster)
- Home Decor
- Fashion
- Accessories
- (Diğer kategoriler otomatik eklenir)

Seçim yapınca:
filteredProducts = products.filter(p => 
  p.category === seçiliFil
)
```

#### 2.4. Sıralama Seçenekleri

```
[Sırala: İsim (A-Z) ▼]

Seçenekler:
1. İsim (A-Z)         → a.name.localeCompare(b.name)
2. İsim (Z-A)         → b.name.localeCompare(a.name)
3. Fiyat (Düşük)      → a.price - b.price
4. Fiyat (Yüksek)     → b.price - a.price
5. Stok (Az)          → a.stock - b.stock
6. Stok (Çok)         → b.stock - a.stock

Her seçim yapınca sorted array oluşturulur
```

#### 2.5. İndirme (CSV)

```
[📥 İndir] butonuna tıkla
    ↓
Kontrol: Hiç ürün var mı?
    ↓
CSV Header oluştur:
  "Product ID,Name,SKU,Category,Stock,Price"
    ↓
Her ürün için satır yap:
  "HCM-001,Handmade Mug,HCM-001,Home Decor,12,45.99"
    ↓
CSV dosyası oluştur (UTF-8 + BOM)
    ↓
Blob'a dönüştür
    ↓
URL.createObjectURL(blob)
    ↓
<a> etiketi oluştur, download attr'ü set et
    ↓
Otomatik tıkla ve indir
    ↓
Dosya: products.csv
```

#### 2.6. Ürün Düzenleme

```
Satırın sağında [✎] ikonuna tıkla
    ↓
setIsEditing(true)
setCurrentProduct({...seçiliÜrün})
    ↓
Modal açılır:
┌────────────────────────────────┐
│ Ürünü Düzenle                  │
├────────────────────────────────┤
│ Adı: [Handmade Mug_________]   │
│ SKU: [HCM-005______________]   │
│ Kategori: [Home Decor______]   │
│ Stok: [12________________]     │
│ Fiyat: [45.99____________]     │
│                                │
│   [İptal]      [Kaydet]        │
└────────────────────────────────┘
    ↓
Değişiklikleri yapın
    ↓
[Kaydet] butonuna tıkla
    ↓
handleSaveProduct() çalışır:
  API.patch(`/products/${id}`, {
    name, sku, category, stock, price
  })
    ↓
Backend Firestore'ı günceller:
  productsRef.doc(id).update({...})
    ↓
Response: 200 OK
    ↓
Modal kapanır
    ↓
fetchProducts() yeniden çalışır
    ↓
Tablo güncellenir
```

#### 2.7. Ürün Silme

```
Satırın sağında [✗] ikonuna tıkla
    ↓
Onay Dialog'u:
┌──────────────────────────────┐
│ ⚠️ Ürünü Silmek İstediğinize  │
│    Emin misiniz?             │
│                              │
│  Bu işlem geri alınamaz.     │
│                              │
│  [İptal]      [Evet, Sil]    │
└──────────────────────────────┘
    ↓
[Evet, Sil] tıkla
    ↓
handleDeleteProduct() çalışır:
  API.delete(`/products/${id}`)
    ↓
Backend:
  productsRef.doc(id).delete()
    ↓
Response: 200 OK
    ↓
fetchProducts() yeniden çalışır
    ↓
Tablo güncellenir, ürün gitti
```

#### 2.8. Sayfalama

```
┌──────────────────────────────┐
│ ◄ Sayfa 1 / 5 ►              │
│ (5 ürün per page göster)     │
└──────────────────────────────┘

Toplam 23 ürün varsa:
- Sayfa 1: Ürün 1-5
- Sayfa 2: Ürün 6-10
- Sayfa 3: Ürün 11-15
- Sayfa 4: Ürün 16-20
- Sayfa 5: Ürün 21-23

[◄] tıkla: currentPage--
[►] tıkla: currentPage++

Limit: min(1) ve max(totalPages)
```

---

## 🛒 3. Siparişler Sayfası

### Amacı
Müşteri siparişlerini yönetme, durum takibi, CSV dışa aktarma

### Veri Kaynağı
- **Firestore `orders` koleksiyonundan** gerçek zamanlı

#### 3.1. Sipariş Listesini Yükleme

```
Sayfa açılır
    ↓
useEffect() tetiklenir
    ↓
fetchOrders() çalışır:
  API.get('/orders')
    ↓
Backend'den JSON döner:
[
  {
    id: "doc1",
    customerName: "John Smith",
    amount: 450.00,
    status: "Completed",
    itemCount: 2,
    timestamp: {_seconds: 1715...}
  },
  { ... }
]
    ↓
Tarihleri parse et (Firestore tarih formatı):
  _seconds kullanılarak Date objesine çevir
    ↓
Durum normalize et:
  "Completed" → "✓ Completed"
  "Processing" → "⚙ Processing"
  "Pending" → "⏳ Pending"
    ↓
setOrders(cleanData)
    ↓
Tabloda görüntüle
```

#### 3.2. Sipariş Arama

```
[Ara sipariş ID veya müşteri...]
    ↓
İnput değişince filtreleme:

filteredOrders = orders.filter(o => 
  o.customerName.includes(searchTerm) ||
  o.id.includes(searchTerm)
)
    ↓
Örnek:
- "John" yazarsanız → John Smith'in siparişi
- "SKY88" yazarsanız → Sipariş ID eşleşen
```

#### 3.3. Durum Filtresi

```
[Status: All Status ▼]

Seçenekler:
- All Status (Hepsi)
- Completed (✓)
- Processing (⚙)
- Pending (⏳)
- Cancelled (✗)

Filtreleme:
filteredOrders = orders.filter(o =>
  statusFilter === 'All Status' ||
  o.status === statusFilter
)
```

#### 3.4. Sıralama

```
[Sırala: Tarihe (Yeni) ▼]

Seçenekler:
1. Tarihe (Yeni)   → dateObj descending
2. Tarihe (Eski)   → dateObj ascending
3. Tutara (Yüksek) → amount descending
4. Tutara (Düşük)  → amount ascending

Sıralama algoritması:
if (sortBy === 'date_desc')
  return b.dateObj - a.dateObj
```

#### 3.5. CSV Dışa Aktarma

```
[📥 İndir] butonuna tıkla
    ↓
Kontrol: Siparişler var mı?
    ↓
CSV header:
  "Order ID,Customer,Total Amount,Status,Items,Date"
    ↓
Her sipariş için satır:
  "#SKY8801,John Smith,$450.00,Completed,2 pcs,17 May 2026"
    ↓
CSV string oluştur
    ↓
Blob oluştur (UTF-8 + BOM)
    ↓
Download trigger
    ↓
Dosya: EtsySync_Orders.csv
```

#### 3.6. Yeni Sipariş Ekleme

```
[+ Yeni Sipariş] butonuna tıkla
    ↓
Modal açılır:
┌────────────────────────────┐
│ Sipariş Oluştur           │
├────────────────────────────┤
│ Müşteri: [______________] │
│ Tutar: [______________]   │
│ Ürün Sayısı: [______]     │
│ Durum: [Processing___▼]   │
│                            │
│  [İptal]      [Oluştur]    │
└────────────────────────────┘
    ↓
Bilgileri doldur
    ↓
[Oluştur] tıkla
    ↓
handleCreateOrder() çalışır:
  API.post('/orders', {
    customerName,
    amount,
    itemCount,
    status,
    timestamp: new Date()
  })
    ↓
Firestore'a yeni dokumen eklenir
    ↓
Response: 201 Created
    ↓
fetchOrders() yeniden çalışır
    ↓
Yeni sipariş tabloda görünür
```

---

## 📦 4. Envanter Yönetimi

### Amacı
Stok seviyeleri kontrol, hızlı güncelleme, stok durumlarını izleme

### Veri Kaynağı
- **Firestore `products` koleksiyonundan** gerçek zamanlı

#### 4.1. Stok Durumları Hesaplama

```
Algoritma (Backend'de + Frontend'de):

for each product {
  stock = product.stock
  price = product.price
  
  // Eşik hesapla
  IF price > 30 THEN
    threshold = 5
  ELSE
    threshold = 10
  
  // Durum belirle
  IF stock = 0 THEN
    status = "Out of Stock" (🔴 Kırmızı)
  ELSE IF stock <= threshold THEN
    status = "Low Stock" (🟠 Turuncu)
  ELSE
    status = "In Stock" (🟢 Yeşil)
}
```

**Örnek Tablo:**
```
┌──────────────┬────────┬───────┬────────┬──────────────────┐
│ Ürün         │ Fiyat  │ Stok  │ Eşik   │ Durum            │
├──────────────┼────────┼───────┼────────┼──────────────────┤
│ Handmade Mug │ $45.99 │ 12    │ 5      │ ✓ In Stock       │
│ Summer Hat   │ $25.50 │ 3     │ 10     │ ⚠ Low Stock      │
│ Velvet Bag   │ $35.00 │ 8     │ 5      │ ✓ In Stock       │
│ Spring Dress │ $20.00 │ 0     │ 10     │ ✗ Out of Stock   │
└──────────────┴────────┴───────┴────────┴──────────────────┘
```

#### 4.2. İstatistik Kartları

```
Kartlar hesaplanır:

1. ✓ IN STOCK
   count = products.filter(p => 
     p.stock > getThreshold(p)
   ).length
   percentage = (count / total) × 100

2. ⚠ LOW STOCK
   count = products.filter(p =>
     p.stock > 0 && p.stock <= getThreshold(p)
   ).length
   percentage = (count / total) × 100

3. ✗ OUT OF STOCK
   count = products.filter(p =>
     p.stock === 0
   ).length
   percentage = (count / total) × 100
```

#### 4.3. Grafik (Bar Chart)

```
Recharts Bar Chart:

chartData = [
  { name: 'In Stock', count: 15, color: '#22C55E' },
  { name: 'Low Stock', count: 4, color: '#F59E0B' },
  { name: 'Out of Stock', count: 2, color: '#EF4444' }
]

X Ekseni: Kategoriler (In Stock, Low Stock, Out)
Y Ekseni: Sayı

Görsel:
█ In Stock (15)
██ Low Stock (4)
█ Out of Stock (2)
```

#### 4.4. Hızlı Stok Güncelleme

```
Ürün satırında:
┌─────────────────────────────────────┐
│ Handmade Mug                        │
│                                     │
│ [−] 11 | 12 | 13 [+]               │
│                                     │
│ [−1] [−5]     [+1] [+5]            │
│ (bulk operations)                   │
│                                     │
│    [Kaydet]  [İptal]               │
└─────────────────────────────────────┘

Seçenekler:
1. Direkt sayı yaz: 12 → 15 (new value)
2. Düğme: [+1] veya [-1]
3. Hızlı: [+5] veya [-5]

[Kaydet] tıkla:
  handleUpdateStock(productId, 12, 3)
    ↓
  newStock = max(0, 12 + 3) = 15
    ↓
  API.patch(`/products/${id}`, {stock: 15})
    ↓
  Firestore güncellenir
    ↓
  Durum otomatik yeniden hesaplanır
```

#### 4.5. Toplu Stok Yönetimi

```
[Yönet Stoku] butonuna tıkla
    ↓
Modal açılır:
┌────────────────────────────────┐
│ 📦 Stok Yönetimi              │
│                                │
│ [Ara ürün...]                  │
│                                │
│ ☑ Handmade Mug    [Stok: 12]  │
│ ☑ Summer Hat      [Stok: 2] ⚠ │
│ ☐ Winter Scarf    [Stok: 0] 🔴│
│ ☑ Spring Dress    [Stok: 15]  │
│                                │
│    [Kaydet Değişiklikleri]     │
└────────────────────────────────┘

Seçili ürünlerin stoğunu düzenle:
1. Checkbox ile ürün seç
2. Her ürün için yeni stok yaz
3. [Kaydet Değişiklikleri] tıkla
    ↓
Tüm değişiklikler aynı anda gönderilir:
  for each seçili ürün {
    API.patch(`/products/${id}`, {stock: newStock})
  }
    ↓
Tamamlandı!
```

---

## 🔔 5. Uyarı Sistemi (Alerts)

### Amacı
Düşük stok ürünlerini otomatik tespit et ve bildir

### Veri Kaynağı
- **Firestore `products` koleksiyonundan** gerçek zamanlı

#### 5.1. Uyarı Algoritması

```
Backend'de (/api/alerts endpoint):

for each product {
  stock = Number(product.stock || 0)
  threshold = Number(product.threshold || 
    (product.price > 30 ? 5 : 10)
  )
  
  IF stock <= threshold THEN
    alerts.push({
      id: product.id,
      name: product.name,
      sku: product.sku,
      stock: stock,
      threshold: threshold,
      price: product.price
    })
}

return alerts
```

#### 5.2. Uyarı Gösterme

```
Frontend'de Alerts Sayfası:

1. API.get('/alerts') çalışır
   └─ Backend hesaplaması dön
   
2. Uyarı kartı gösterilir:
   ┌─────────────────────────────────┐
   │ 🔴 KRİTİK: 4 ürün reorder      │
   │    gereklidir!                  │
   │                                 │
   │ ALGORITHM ACTIVE (Otomatik)     │
   └─────────────────────────────────┘

3. Uyarılı ürünler tabloda:
   ┌────────────────────────────────┐
   │ Ürün      │ Stok │ Eşik │ Durum│
   ├────────────────────────────────┤
   │ Hat       │  2   │  10  │ ⚠   │
   │ Scarf     │  0   │  10  │ 🔴  │
   │ Dress     │  3   │  5   │ ⚠   │
   │ Bag       │  4   │  10  │ ⚠   │
   └────────────────────────────────┘
```

#### 5.3. Arama ve Sıralama

```
[Ara ürün...]
    ↓
filteredAlerts = alerts.filter(a =>
  a.name.includes(searchTerm) ||
  a.sku.includes(searchTerm)
)

[Sırala ▼]
├─ Stok (Az olandan çok olana)
├─ Stok (Çok olandan az olana)
├─ Ürün Adı (A-Z)
└─ Ürün Adı (Z-A)
```

#### 5.4. Uyarı Ciddiyeti

```
SEVIYE 1: ⚠️ WARNING
├─ Stok: > 0 and <= threshold
├─ Anlamı: Kısa sürede reorder yapın
├─ Renk: TURUNCU (#F59E0B)
└─ Örnek: 2 stok kalmış ürün

SEVIYE 2: 🔴 CRITICAL
├─ Stok: = 0
├─ Anlamı: ACİL REORDER GEREKLI!
├─ Renk: KIRMIZI (#EF4444)
└─ Örnek: Tükenmiş ürün
```

#### 5.5. Aksiyon Almak

```
Uyarılı ürün görünce:

1. Tedarikçi ile iletişime geç
2. Reorder için siparişin ver
3. Yeni stok aldıktan sonra:
   
   a) Envanter Yönetim sayfasına git
   b) Ürünün stoğunu güncelle
   c) API.patch() ile gönder
   d) Sistem otomatik durum değiştirir
      (Low Stock → In Stock)

4. Uyarı listesinden kaldırılır
```

---

## 📊 6. Analitik ve Raporlar

### Amacı
Satış trendleri, gelir analizi, ürün performansı

### Veri Kaynağı
- **Firestore `orders` + `products` koleksiyonundan**

#### 6.1. Metrik Hesapları

```
TOPLAM GELİR:
  totalRevenue = SUM(orders[].amount)
  Örnek: $450 + $320 + $285 = $1,055

TOPLAM SİPARİŞ:
  totalOrders = COUNT(orders)
  Örnek: 10 sipariş

ORTALAMA SİPARİŞ DEĞERİ (AOV):
  aov = totalRevenue / totalOrders
  Örnek: $1,055 / 10 = $105.50

ÜRÜN ÇEŞİDİ:
  productVariety = COUNT(DISTINCT products.sku)
  Örnek: 21 farklı ürün
```

#### 6.2. 7 Günlük Satış Grafiği

```
Algoritma:

1. Bugünün tarihi bul
2. Haftanın ilk günü (Pazartesi) bulMERGE
3. Pazartesi'den Pazar'a 7 gün data
4. Her gün için satış topla:

   const mondayData = []
   for (i = 0; i < 7; i++) {
     date = monday + i
     dayOrders = orders.filter(o => 
       o.dateObj.date === date
     )
     dailySales = SUM(dayOrders[].amount)
     mondayData.push({
       day: dayName[i],
       current: dailySales,
       previous: trendData[i]
     })
   }

5. Recharts Line Chart'ında göster:
   - Mavi Çizgi: Bu hafta
   - Gri Çizgi: Geçen hafta (Trend)
```

**Örnek Veri:**
```
Pazartesi:   $900  (Bu hafta) vs $1,200 (Geçen hafta)
Salı:        $1,500 vs $1,900
Çarşamba:    $1,800 vs $1,500
Perşembe:    $2,000 vs $2,200
Cuma:        $2,400 vs $1,800
Cumartesi:   $2,600 vs $2,400
Pazar:       $2,800 vs $3,200
```

#### 6.3. En Çok Satan Ürünler

```
Algoritma:

topSellingProducts = []

for each product {
  timesOrdered = orders.filter(o =>
    o.items.includes(product.sku)
  ).length
  
  topSellingProducts.push({
    name: product.name,
    count: timesOrdered,
    revenue: timesOrdered × product.price
  })
}

Sırala: count descending
Göster: Top 5

Örnek:
1. Handmade Mug    - 8 adet - $367.92
2. Summer Hat      - 6 adet - $192.00
3. Velvet Bag      - 4 adet - $140.00
```

#### 6.4. Tarih Aralığı Filtreleri

```
[Tarih Aralığı ▼]

├─ Last 7 Days (Bu Hafta)
│  └─ Başlangıç: today - 7 gün
│  └─ Bitiş: today
│
├─ Last 30 Days (Bu Ay)
│  └─ Başlangıç: today - 30 gün
│  └─ Bitiş: today
│
├─ Last 3 Months
│  └─ Başlangıç: today - 90 gün
│  └─ Bitiş: today
│
└─ Last Year
   └─ Başlangıç: today - 365 gün
   └─ Bitiş: today

Seçim yapınca:
filteredOrders = orders.filter(o =>
  o.dateObj >= startDate &&
  o.dateObj <= endDate
)

Grafikler ve metrikler güncellenir
```

#### 6.5. Raporlar (PDF/CSV)

```
PDF/CSV Rapor Türleri:

1. SALES REPORT (Satış)
   ├─ Tüm siparişlerin listesi
   ├─ Müşteri, tutar, tarih
   ├─ Toplam gelir özeti
   ├─ Günlük, haftalık, aylık breakdown
   └─ Trend analizi

2. INVENTORY REPORT (Envanter)
   ├─ Tüm ürünlerin stok seviyeleri
   ├─ Düşük stok uyarıları
   ├─ Reorder önerileri
   ├─ Envanter değeri
   └─ SKU vs Stok matrisi

3. CUSTOMER ANALYTICS
   ├─ En aktif müşteriler
   ├─ Müşteri başına ortalama sipariş
   ├─ Tekrar satın alma oranı
   ├─ En yüksek harcayan müşteriler
   └─ Müşteri segmentasyonu

İndirme:
[Seç] → Rapor türü seç
[İndir] → Dosya download
```

---

## ⚙️ 7. Ayarlar ve Profil

### Amacı
Kişi bilgileri, sistem ayarları, hesap yönetimi

#### 7.1. Admin Profili

```
Sayfa sağ üstte: Admin Adı | Admin Email

Profil Modal Açmak:
[Admin Adı] tıkla
    ↓
┌────────────────────────────────┐
│ Profil Düzenle                │
├────────────────────────────────┤
│ Adınız: [John Doe___________]  │
│ Email: [john@example.com___]   │
│                                │
│     [İptal]     [Kaydet]       │
└────────────────────────────────┘

Kaydet işlemi:
  API.post('/users/admin_profile', {
    name: yeniAd,
    email: yeniEmail
  })
    ↓
Firestore settings.admin_profile güncellenir
    ↓
Sayfa başlığında anında görüntülenir
```

#### 7.2. Sistem Ayarları

```
Settings sayfası:

1. MAĞAZA BİLGİSİ
   ├─ Mağaza Adı
   ├─ Mağaza URL
   ├─ Ayakkabı Tarihi
   └─ Vergi Kimlik No

2. PARA BİRİMİ VE DİL
   ├─ Para Birimi: USD
   ├─ Dil: Türkçe
   └─ Tarih Formatı

3. BİLDİRİM AYARLARI
   ├─ Düşük Stok Uyarısı: ON
   ├─ Yeni Sipariş Uyarısı: ON
   └─ Günlük Rapor: OFF

4. ENTEGRASYON AYARLARI
   ├─ Etsy API: Bağlantılı ✓
   ├─ Shopify: Bağlantı Yok
   ├─ Amazon: Bağlantı Yok
   └─ Stripe: Bağlantı Yok
```

---

**Her sayfa gerçek verileri Firestore'dan çeker ve otomatik günceller.**

**Son Güncelleme:** 18 Mayıs 2026

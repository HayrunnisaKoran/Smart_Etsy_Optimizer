# 📖 Smart Etsy Optimizer - Kullanıcı El Kitabı

**Versiyon:** 1.0.0  
**Son Güncelleme:** 18 Mayıs 2026  
**Dil:** Türkçe

---

## 📑 İçindekiler

1. [Başlangıç](#başlangıç)
2. [Sistemi Açma ve Giriş](#sistemi-açma-ve-giriş)
3. [Ana Sayfa (Dashboard)](#ana-sayfa-dashboard)
4. [Ürünler Sayfası](#ürünler-sayfası)
5. [Siparişler Sayfası](#siparişler-sayfası)
6. [Envanter Yönetimi](#envanter-yönetimi)
7. [Uyarı Sistemi](#uyarı-sistemi)
8. [Analitik ve Raporlar](#analitik-ve-raporlar)
9. [Sık Sorulan Sorular](#ssk)
10. [Sorun Giderme](#sorun-giderme)

---

## ✅ Başlangıç

### Sistem Gereksinimleri
- **Web Tarayıcı:** Chrome, Firefox, Safari, Edge (En son sürüm)
- **İnternet:** Stabil internet bağlantısı
- **Hesap:** Firebase tarafından sağlanan giriş kimlik bilgileri

### Önemli Bilgiler
- ✓ **Bulut Temelli:** Tüm verileriniz Firebase Firestore'da güvenle depolanır
- ✓ **Gerçek Zamanlı:** Veriler anlık olarak güncellenir
- ✓ **Şifreli:** Firebase Authentication ile korunan giriş sistemi
- ✓ **Etsy Entegrasyonu:** Otomatik satış verisi çekme ve stok senkronizasyonu

---

## 🔐 Sistemi Açma ve Giriş

### Giriş Ekranı

1. **Tarayıcınızı açın** ve Smart Etsy Optimizer URL'sine gidin
   - **Lokal:** `http://localhost:5173` (geliştirme ortamında)
   - **Canlı:** Firebase Hosting link'i

2. **Giriş Sayfası:**
   ```
   ┌─────────────────────────────┐
   │  Smart Etsy Optimizer       │
   │                             │
   │  📧 Email: [_____________]  │
   │  🔑 Şifre: [_____________]  │
   │                             │
   │  [Giriş Yap] [Kaydol]       │
   └─────────────────────────────┘
   ```

3. **Giriş Bilgileriniz:**
   - **Email:** Firebase'e kayıtlı email adresiniz
   - **Şifre:** Belirlediğiniz güvenli şifre

4. **Giriş Yap** butonuna tıklayın

### Hesap Oluşturma (İlk Kullanım)

1. **"Kaydol"** linkine tıklayın
2. **Bilgilerinizi doldurun:**
   - Email adresiniz
   - Güçlü bir şifre (min. 8 karakter)
3. **Kaydol** butonuna tıklayın
4. Başarılı kayıttan sonra otomatik giriş yapılır

---

## 📊 Ana Sayfa (Dashboard)

Dashboard, işinizin anlık görünümüdür. **Tüm veriler Firebase'den gerçek zamanlı çekilir.**

### 1. Özet İstatistikler (Üst Kartlar)

```
┌──────────────────────────────────────────────────────────┐
│ 💰 Toplam Satış Değeri  📦 Satılan Ürün Miktarı         │
│   $2,850.00            45 adet                          │
│                                                          │
│ 🏭 Envanter Değeri      📈 Aylık Büyüme                │
│   $15,420.50           +12.5%                           │
└──────────────────────────────────────────────────────────┘
```

**Her kartın gösterdiği:**
- **💰 Toplam Satış Değeri:** Tüm tamamlanan siparişlerin toplam tutarı
- **📦 Satılan Ürün Miktarı:** Bu ayda satılan toplam ürün adedi
- **🏭 Envanter Değeri:** Depodaki ürünlerin (Stok × Fiyat) toplam değeri
- **📈 Aylık Büyüme:** Son aydan bu aya göre satış artışı %

### 2. Satış Grafiği (Grafik Alanı)

```
    │     ╱╲        ╱╲
    │    ╱  ╲      ╱  ╲      ← Satış Trendi
    │   ╱    ╲    ╱    ╲
    ├──────────────────────
    Pzt  Salı  Çrş  Prş  Cum
```

**Grafik Açıklaması:**
- X Ekseni: Haftanın günleri (Pazartesi - Pazar)
- Y Ekseni: Satış miktarı ($)
- **Mavi Çizgi:** Bu hafta satışları
- **Gri Çizgi:** Geçen hafta satışları (trend karşılaştırması)

**Periyot Seçimi:**
- **Daily:** Günlük satışlar
- **Weekly:** Haftalık toplam
- **Monthly:** Aylık toplam

### 3. Son Siparişler (Tablo)

```
┌─────────────────────────────────────────────────┐
│ Son Siparişler                                  │
├─────────────────────────────────────────────────┤
│ Müşteri        │ Miktar  │ Durum      │ Saat   │
├─────────────────────────────────────────────────┤
│ John Smith     │ $450.00 │ Completed  │ 14:25  │
│ Sarah Johnson  │ $320.50 │ Completed  │ 13:10  │
│ Mike Davis     │ $285.75 │ Processing │ 11:45  │
└─────────────────────────────────────────────────┘
```

**Veriler Nereden Geliyor:**
- Firestore `orders` koleksiyonundan otomatik çekiliyor
- Her yeni sipariş eklendiğinde tablaya anında eklenir

### 4. Yeni Ürün Ekleme

**Modal Açmak:**
1. Sağ üstteki **"+ Yeni Ürün Ekle"** butonuna tıklayın
2. Form açılır:
   ```
   ┌───────────────────────────────────┐
   │ Ürün Ekle                         │
   ├───────────────────────────────────┤
   │ Ürün Adı:    [_________________]  │
   │ SKU:         [_________________]  │
   │ Stok:        [_________________]  │
   │ Fiyat ($):   [_________________]  │
   │                                   │
   │      [İptal]       [Ekle]         │
   └───────────────────────────────────┘
   ```

3. **Form Alanları:**
   - **Ürün Adı:** Etsy'de gösterilecek ürün ismi
   - **SKU:** Stok takip kodu (örn: HCM-005)
   - **Stok:** Mevcut stok miktarı
   - **Fiyat:** Dolar cinsinden satış fiyatı

4. **Ekle** butonuna tıklayın → Ürün Firestore'a kaydedilir

### 5. Veri Senkronizasyon (Refresh)

**Etsy Veri Çekimi:**

```
[🔄 Verileri Yenile] ← Butonuna tıklayın
    ↓
[Etsy'den satış verileri çekiliyor...]
    ↓
[Stok güncelleniyor...]
    ↓
[Başarılı! ✓]
```

**Ne Olur:**
1. Etsy API'sine bağlanır
2. Belirtilen tarih aralığındaki satışları çeker
3. Stokları otomatik azaltır
4. Firestore'da kayıt oluşturur
5. Dashboard grafikleri günceller

**Senkronizasyon Logları:**
```
├─ 14:25 | Etsy'den Satış Çekildi: SKU HCM-005, 1 Adet
├─ 14:25 | Stok Entegrasyonu: SKU HCM-005 → 9 adet
├─ 14:26 | Mağaza verileri başarıyla senkronize edildi!
```

---

## 📦 Ürünler Sayfası

Tüm ürünlerinizi yönetme sayfası. **Tüm veriler Firestore'dan gerçek zamanlı çekilir.**

### Sayfa Düzeni

```
┌─────────────────────────────────────────────────┐
│ 🏷️ Ürünler                                      │
│                                                 │
│ [Ara...] [Kategori ▼] [Sırala ▼] [İndir] [+]   │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Ürün Adı    │ SKU  │ Stok │ Fiyat │ İşlem  │ │
│ ├─────────────────────────────────────────────┤ │
│ │ Handmade... │ HCM  │  12  │ $45.99│ ✎ ✗   │ │
│ │ Vintage...  │ VFP  │   5  │ $32.50│ ✎ ✗   │ │
│ │ Summer...   │ SMR  │   8  │ $28.99│ ✎ ✗   │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ◄ 1 - 5 / 23 Ürün ►                             │
└─────────────────────────────────────────────────┘
```

### 1. Arama İşlemi

**Nasıl Aranır:**
1. En üstteki **"Ara..."** kutusuna yazın
2. Ürün adı veya SKU'ya göre filtrelenir
3. Arama anlık olur (Her karakter yazıldığında güncellenir)

**Örnek:**
- "Handmade" yazarsanız → "Handmade Mug" bulunur
- "HCM" yazarsanız → "HCM-005" SKU'su bulunur

### 2. Kategori Filtresi

**Kategorilere Göre Filtrele:**
1. **Kategori** dropdown'ına tıklayın
2. Seçenekler:
   - All Categories (Tüm ürünler)
   - (Otomatik eklenmiş kategori isimler)

3. Kategoriye tıklayın → Sadece o kategorinin ürünleri görünür

### 3. Sıralama Seçenekleri

**Sırala** dropdown'ında kullanılabilir seçenekler:
```
━━━━━━━━━━━━━━━━━━━━━━━
📊 Sıralama Seçenekleri
━━━━━━━━━━━━━━━━━━━━━━━
↑ İsim (A→Z)
↓ İsim (Z→A)
↑ Fiyat (Düşük)
↓ Fiyat (Yüksek)
↑ Stok (Az)
↓ Stok (Çok)
━━━━━━━━━━━━━━━━━━━━━━━
```

### 4. İndirme İşlemi (CSV)

**Excel/Tablo Programına Aktarma:**
1. Sağ üstteki **"📥 İndir"** butonuna tıklayın
2. Bilgisayarınıza `products.csv` dosyası indirilir
3. Excel veya Google Sheets'te açabilirsiniz

**CSV İçeriği:**
```
Product ID,Name,SKU,Category,Stock,Price
HCM-001,Handmade Mug,HCM-001,Home Decor,12,45.99
SMR-012,Summer Hat,SMR-012,Fashion,5,32.50
```

### 5. Ürün Düzenleme

**Ürünü Değiştirmek:**
1. Satırın sağındaki **✎ (Düzenle)** ikonuna tıklayın
2. Modal açılır:
   ```
   ┌──────────────────────────────┐
   │ Ürünü Düzenle               │
   ├──────────────────────────────┤
   │ Adı: [Handmade Mug_______]   │
   │ SKU: [HCM-001___________]    │
   │ Kategori: [Home Decor___]    │
   │ Stok: [12__________]         │
   │ Fiyat: [45.99__________]     │
   │                              │
   │    [İptal]  [Kaydet]         │
   └──────────────────────────────┘
   ```

3. Değişiklikleri yapın
4. **Kaydet** butonuna tıklayın → Firestore güncellenir

### 6. Ürün Silme

**Ürünü Kaldırmak:**
1. Satırın sağındaki **✗ (Sil)** ikonuna tıklayın
2. Onay dialog'u görünür:
   ```
   ⚠️ Bu ürünü silmek istediğinize emin misiniz?
   Bu işlem geri alınamaz.
   
        [İptal]     [Evet, Sil]
   ```

3. **Evet, Sil** seçin → Ürün silinir

### 7. Sayfalama

**Sayfalar Arasında Geçiş:**
```
◄ Önceki | Sayfa 1 / 5 | Sonraki ►
```
- **Önceki:** Bir önceki sayfa
- **Sonraki:** Bir sonraki sayfa
- Her sayfada 5 ürün gösterilir

---

## 🛒 Siparişler Sayfası

Etsy'den gelen tüm siparişleri yönetin. **Veriler Firestore orders koleksiyonundan çekilir.**

### Sayfa Düzeni

```
┌──────────────────────────────────────────────────────┐
│ 🛒 Siparişler                                        │
│                                                      │
│ [Ara...] [Durum ▼] [Sırala ▼] [İndir CSV] [Yeni]   │
│                                                      │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Sipariş ID │ Müşteri │ Tutar │ Durum │ Tarih  │ │
│ ├──────────────────────────────────────────────────┤ │
│ │ #SKY8801   │ John    │ $450  │ ✓ Done│ 17 May │ │
│ │ #SKY8802   │ Sarah   │ $320  │ ⚙ Pro│ 17 May │ │
│ │ #SKY8803   │ Mike    │ $285  │ ✓ Done│ 16 May │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│ ◄ 1 - 5 / 47 Sipariş ►                              │
└──────────────────────────────────────────────────────┘
```

### 1. Sipariş Arama

**Sipariş Bul:**
1. **"Ara..."** kutusuna yazın
2. Sipariş ID veya müşteri ismine göre ara
3. Otomatik filtrelenir

### 2. Durum Filtresi

**Duruma Göre Filtrele:**
```
━━━━━━━━━━━━━━━━━━
Tüm Durumlar
━━━━━━━━━━━━━━━━━━
✓ Completed (Tamamlandı)
⚙ Processing (İşlemde)
⏳ Pending (Bekleniyor)
✗ Cancelled (İptal)
━━━━━━━━━━━━━━━━━━
```

Seçtiğiniz duruma ait siparişler gösterilir.

### 3. Sıralama

**Sırala Seçenekleri:**
- **Tarihe göre (Yeni):** En yeni siparişler en üstte
- **Tarihe göre (Eski):** En eski siparişler en üstte
- **Tutara göre (Yüksek):** Pahalı siparişler önce
- **Tutara göre (Düşük):** Ucuz siparişler önce

### 4. CSV'ye Aktarma

**Siparişleri İndir:**
1. **"📥 İndir"** butonuna tıklayın
2. `orders.csv` indirilir
3. Excel veya Google Sheets'te açın

**İçeriği:**
```
Order ID,Customer,Total Amount,Status,Items,Date
#SKY8801,John Smith,$450.00,Completed,3 pcs,17 May 2026
#SKY8802,Sarah Johnson,$320.50,Processing,2 pcs,17 May 2026
```

### 5. Yeni Sipariş Ekle

**Manuel Sipariş Oluştur:**
1. **"+ Yeni Sipariş"** butonuna tıklayın
2. Form açılır:
   ```
   ┌──────────────────────────────┐
   │ Sipariş Oluştur             │
   ├──────────────────────────────┤
   │ Müşteri: [______________]    │
   │ Tutar: [______________]      │
   │ Ürün Sayısı: [__________]    │
   │ Durum: [Processing____▼]     │
   │                              │
   │    [İptal]  [Oluştur]        │
   └──────────────────────────────┘
   ```

3. Bilgileri doldurun
4. **Oluştur** → Firestore'a kaydedilir

---

## 📦 Envanter Yönetimi

Stok seviyelerinizi kontrol edin ve yönetin.

### Sayfa Düzeni

```
┌───────────────────────────────────────────────────┐
│ 🏭 Envanter Yönetimi                              │
│                                                   │
│ ┌────────────┬────────────┬────────────┐          │
│ │ ✓ Stoklı  │ ⚠ Uyarı   │ ✗ Tükendi  │          │
│ │ 15 ürün   │  4 ürün   │  2 ürün   │          │
│ │ 65%       │  17%      │  9%       │          │
│ └────────────┴────────────┴────────────┘          │
│                                                   │
│ [Ara...] [Yönet Stoku]                           │
│                                                   │
│ ┌───────────────────────────────────────────────┐ │
│ │ Ürün          │ Stok │ Durum        │ İşlem  │ │
│ ├───────────────────────────────────────────────┤ │
│ │ Handmade Mug  │ 12   │ ✓ In Stock   │ +- ✎   │ │
│ │ Summer Hat    │ 2    │ ⚠ Low Stock  │ +- ✎   │ │
│ │ Winter Scarf  │ 0    │ ✗ Out Stock  │ +- ✎   │ │
│ └───────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────┘
```

### 1. Stok Durumları ve Kuralları

**Veriler Firestore'dan çekilir. Durum şu kurala göre otomatik belirlenir:**

```
IF stok = 0
    THEN durum = "Out of Stock" (KIRMIZı 🔴)
ELSE IF stok < threshold
    THEN durum = "Low Stock" (TURUNCU 🟠)
ELSE
    THEN durum = "In Stock" (YEŞİL 🟢)

threshold = EĞER fiyat > $30 THEN 5 ELSE 10
```

**Örnekler:**
- Ürün A: Fiyat $45, Stok 8 → ✓ In Stock (8 > 5)
- Ürün B: Fiyat $45, Stok 3 → ⚠ Low Stock (3 ≤ 5)
- Ürün C: Fiyat $20, Stok 8 → ⚠ Low Stock (8 ≤ 10)
- Ürün D: Stok 0 → ✗ Out of Stock (0 = 0)

### 2. İstatistik Kartları

**Üç Kart Gösterilir:**

1. **✓ Stoklı (Yeşil):** 
   - Yeterli stok olan ürünler
   - Stok > threshold

2. **⚠ Uyarı (Turuncu):**
   - Düşük stok ürünleri
   - 0 < Stok ≤ threshold
   - **Reorder yapılmalı!**

3. **✗ Tükendi (Kırmızı):**
   - Stok = 0 ürünleri
   - **ACİL: Reorder gerekli**

### 3. Hızlı Stok Güncelleme

**Stok Miktarını Değiştir:**
```
┌─────────────────────────────────┐
│ Handmade Mug (Şu anki: 12)     │
│                                 │
│ [−] 11  │  12  │ 13 [+]        │
│                                 │
│ [-1] [-5]     [+1] [+5]        │
│                                 │
│    [Kaydet]      [İptal]        │
└─────────────────────────────────┘
```

**Nasıl:**
1. Ürünün yanında **+ − butonları** vardır
2. Direkt sayı yazabilirsiniz
3. **Kaydet** → Firestore güncellenir
4. Sayfa anında yenilenir

### 4. Toplu Stok Yönetimi

**"Yönet Stoku" Butonuna Tıklayın:**
```
┌─────────────────────────────────────┐
│ 📦 Stok Yönetimi                   │
│                                     │
│ [Ara ürün...]                       │
│                                     │
│ ☑ Handmade Mug      [Stok: 12]     │
│ ☑ Summer Hat        [Stok: 2] ⚠️  │
│ ☑ Winter Scarf      [Stok: 0] 🔴  │
│ ☐ Spring Dress      [Stok: 15]     │
│                                     │
│    [Kaydet Değişiklikleri]          │
└─────────────────────────────────────┘
```

**Seçili Ürünlerin Stoğunu Toplu Güncelle:**
1. Güncellemek istediğiniz ürünleri işaretleyin
2. Her ürün için yeni stok yazın
3. **Kaydet Değişiklikleri** → Hepsi aynı anda güncellenir

---

## 🔔 Uyarı Sistemi

Otomatik düşük stok uyarıları.

### Sayfa Düzeni

```
┌──────────────────────────────────────────┐
│ ⚠️ Sistem Uyarıları                      │
│                                          │
│ 🔴 KRİTİK: 4 ürün reorder gerekli       │
│                                          │
│ [Ara...] [Sırala ▼]                    │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ Ürün         │ Stok │ Eşik │ Durum  │ │
│ ├──────────────────────────────────────┤ │
│ │ Summer Hat   │  2   │  10  │ ⚠ WARN │ │
│ │ Winter Scarf │  0   │  10  │ 🔴 CRIT│ │
│ │ Spring Dress │  3   │  5   │ ⚠ WARN │ │
│ │ Velvet Bag   │  4   │  10  │ ⚠ WARN │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ALGORITHM ACTIVE (Otomatik Hesaplama)    │
└──────────────────────────────────────────┘
```

### 1. Uyarı Algoritması

**Otomatik hesaplamalar (Backend'de yapılır):**

```javascript
// Eşik Değeri Hesaplama
threshold = EĞER ürün_fiyatı > $30 THEN 5 ELSE 10

// Uyarı Kriteri
EĞER stok <= threshold THEN 
    uyarı_göster("Düşük Stok: " + ürün_ismi)
```

**Örnekler:**

| Ürün | Fiyat | Stok | Eşik | Uyarı Göster |
|------|-------|------|------|--------------|
| Mug | $45 | 8 | 5 | ✓ Evet (8 ≤ 5? Hayır, göster? Hayır) |
| Mug | $45 | 3 | 5 | ✓ Evet (3 ≤ 5) ⚠️ |
| Hat | $25 | 2 | 10 | ✓ Evet (2 ≤ 10) ⚠️ |
| Hat | $25 | 12 | 10 | ✗ Hayır (12 > 10) |

### 2. Uyarı Ciddiyeti

- **⚠️ WARNING (Uyarı):** Stok düşük, kısa sürede reorder yapın
- **🔴 CRITICAL (Kritik):** Stok çok az, acil reorder yapın
- **🟢 OK:** Yeterli stok, sorun yok

### 3. Arama ve Sıralama

**Uyarısı Olan Ürünleri Ara:**
- İsim veya SKU yazın
- Otomatik filtrelenir

**Sıralama:**
```
━━━━━━━━━━━━━━━━━━━
Stok Miktarına Göre
━━━━━━━━━━━━━━━━━━━
↑ Az olandan çok olana
↓ Çok olandan az olana
↑ Ürün adına göre (A-Z)
━━━━━━━━━━━━━━━━━━━
```

### 4. Aksiyon Almak

**Reorder İşlemi:**
1. Uyarısı olan ürüne tıklayın
2. Tedarikçi ile iletişime geçin
3. Yeni stok miktarı aldıktan sonra sistemi güncelleyin (Envanter Yönetimi sayfasında)

---

## 📈 Analitik ve Raporlar

Satışlarınızı analiz edin. **Tüm veriler Firestore'dan gerçek zamanlı çekilir.**

### Analitik Sayfası

```
┌─────────────────────────────────────────────────┐
│ 📊 Analitik & Raporlar                          │
│                                                 │
│ 💰 Toplam Gelir: $2,850  📈 AOV: $286          │
│ 📦 Toplam Sipariş: 10    🎯 Ürün Çeşidi: 21   │
│                                                 │
│ ┌──────────────────────────────────────────────┐ │
│ │  Satış Trendi (Bu Hafta vs Geçen Hafta)     │ │
│ │                                              │ │
│ │    ╱╲        ╱╲      ← Bu Hafta              │ │
│ │   ╱  ╲      ╱  ╲                             │ │
│ │  ╱    ╲    ╱    ╲    ← Geçen Hafta          │ │
│ │ ╱──────────────────────                      │ │
│ │ Pzt  Salı Çrş Prş Cum Cmt Paz               │ │
│ └──────────────────────────────────────────────┘ │
│                                                 │
│ [Tarih Aralığı ▼]  [Sırala ▼]                 │
└─────────────────────────────────────────────────┘
```

### 1. Özet Metrikler

**Hesaplanan Değerler (Firestore'dan):**

- **💰 Toplam Gelir:** 
  ```
  = SUM(tüm siparişlerin amount alanı)
  ```

- **📦 Toplam Sipariş:** 
  ```
  = COUNT(orders koleksiyonu)
  ```

- **📈 AOV (Ortalama Sipariş Değeri):**
  ```
  = Toplam Gelir ÷ Toplam Sipariş
  ```

- **🎯 Ürün Çeşidi:**
  ```
  = COUNT(unique products)
  ```

### 2. Satış Trendi Grafiği

**Çizgi Grafik (Line Chart):**
```
Mavi Çizgi (Bu Hafta):  Pazartesi→Pazar satışları
Gri Çizgi (Geçen Hafta): Karşılaştırma trendi
```

**Pazartesi-Pazar Takvimi:**
- Otomatik olarak haftanın ilk gütü (Pazartesi) bulunur
- 7 gün boyunca satış gösterilir
- Her gün ayrı data noktası

### 3. Ürün Performansı

```
En Çok Satan Ürünler:
┌─────────────────────────────────┐
│ 1. Handmade Mug    - 8 satış    │
│ 2. Summer Hat      - 6 satış    │
│ 3. Velvet Bag      - 4 satış    │
└─────────────────────────────────┘
```

### 4. Tarih Aralığı Seçimi

**"Tarih Aralığı" Dropdown:**
```
━━━━━━━━━━━━━━━━━━━━━
📅 Zaman Aralığı
━━━━━━━━━━━━━━━━━━━━━
🔵 Last 7 Days (Bu Hafta)
   Last 30 Days (Bu Ay)
   Last 3 Months (3 Ay)
   Last Year (1 Yıl)
━━━━━━━━━━━━━━━━━━━━━
```

Seçtiğiniz periyoda göre grafikler güncellenir.

### 5. Raporlar Sayfası

**"Raporlar" Bölümü:**
```
┌─────────────────────────────────┐
│ 📄 Raporlar                    │
│                                 │
│ ✓ Satış Raporu (PDF/CSV)       │
│ ✓ Envanter Raporu (PDF/CSV)    │
│ ✓ Müşteri Analizi (PDF/CSV)    │
│                                 │
│ [Seç] [✓ İndir]                │
└─────────────────────────────────┘
```

**Rapor Türleri:**

1. **Satış Raporu:**
   - Tüm siparişler listesi
   - Müşteri bilgileri
   - Tarihsel trend
   - Toplam gelir özeti

2. **Envanter Raporu:**
   - Mevcut stok seviyeleri
   - Düşük stok ürünleri
   - Reorder önerileri
   - Envanter değeri

3. **Müşteri Analizi:**
   - En aktif müşteriler
   - Ortalama sipariş değeri
   - Tekrar satın alma oranı

---

## ❓ SSS (Sık Sorulan Sorular)

### S: Verilerim Firebase'de güvenli mi?

**C:** Evet! Firebase enkripsiyon ve authentication kullanır:
- TLS/SSL ile şifrelenmiş iletişim
- Firestore firewall koruması
- Kullanıcı tabanlı erişim kontrolleri

### S: Etsy'den otomatik veri çekiliyor mu?

**C:** Evet! **"Verileri Yenile"** butonuna tıklarsanız:
1. Etsy API'sine bağlanır
2. Belirtilen tarih aralığındaki satışları çeker
3. Otomatik stok azaltır
4. Firestore'a kaydeder

### S: Verilerim silo (offline) çalışırsa ne olur?

**C:** İnternet bağlantısı kesilirse:
- Varsayılan bilgiler gösterilir
- Değişiklikler kaydedilmez
- Bağlantı yeniden açıldığında "Senkronize Et" butonuna tıklayın

### S: Verileri yedeleyebilir miyim?

**C:** Evet! Raporlar sayfasından:
1. Raporları seçin
2. **"İndir"** butonuna tıklayın
3. CSV veya PDF olarak indirilir

### S: Hangi tarayıcılar destekleniyor?

**C:** Tüm modern tarayıcılar:
- ✓ Chrome / Chromium
- ✓ Firefox
- ✓ Safari
- ✓ Edge
- ✓ Opera

### S: Birden fazla kullanıcı aynı anda çalışabilir mi?

**C:** Evet! Firebase real-time database kullandığı için:
- Aynı anda 10+ kullanıcı çalışabilir
- Veriler anlık senkronize olur
- Konflikt yönetimi otomatik

### S: Şifremi unuttum

**C:** Giriş sayfasında:
1. **"Şifremi Unuttum"** linkine tıklayın
2. Email adresinizi yazın
3. Sıfırlama linki gönderilir
4. Email'deki linke tıklayın
5. Yeni şifre belirleyin

### S: Hesabımı nasıl silerim?

**C:** Ayarlar sayfasında (⚙️):
1. **"Hesap Sil"** butonuna tıklayın
2. Onay kutusu işaretleyin
3. **"Kalıcı olarak sil"** butonuna tıklayın
4. Tüm verileriniz silinir

---

## 🔧 Sorun Giderme

### Sorun: Sayfa boş yükleniyor

**Çözüm:**
1. Sayfayı yenile (F5 tuşu)
2. Tarayıcı cache'ini temizle (Ctrl+Shift+Delete)
3. Başka tarayıcıda dene

### Sorun: "Firebase bağlantısı hatası"

**Çözüm:**
1. İnternet bağlantısını kontrol et
2. Firebase servisinin kullanılabilir olup olmadığını kontrol et
3. Backend'in çalışıp çalışmadığını kontrol et: `npm start`

### Sorun: Verileri yenileyemiyor

**Çözüm:**
1. **Verileri Yenile** butonuna tekrar tıkla
2. Tarih aralığını kontrol et
3. Etsy API anahtarını kontrol et (.env'de)
4. Backend loglarını kontrol et: `console.log()`

### Sorun: Ürün satırı silmiyor

**Çözüm:**
1. Sayfayı yenile
2. Tekrar dene
3. Tarayıcı cache'ini temizle
4. Devtools'da "Network" tab'ında hatayı kontrol et

### Sorun: Grafikler gösterilmiyor

**Çözüm:**
1. Siparişleriniz var mı kontrol et (Orders sayfasında)
2. Eğer veri yoksa, Dashboard'da "Verileri Yenille"ye tıkla
3. Tarayıcıyı yenile
4. JavaScript'in açık olduğundan emin ol

### Sorun: CSV indirmede hata

**Çözüm:**
1. Tarayıcının pop-up özelliğini açık yap
2. Başka tarayıcıda dene
3. Verileriniz boş değil mi kontrol et
4. Dosya yer yok mu kontrol et

### Sorun: Giriş yapamıyor

**Çözüm:**
1. **Email ve şifrenizi doğru yazdığınızdan emin ol**
2. **Capslock (Büyük Harf Kilidi) açık mı kontrol et**
3. Hesabı kaydolmadıysan **"Kaydol"** linkine tıkla
4. Şifreni unuttuysan **"Şifremi Unuttum"** linkine tıkla

### Sorun: Mobil telefonda çalışmıyor

**Çözüm:**
1. Telefonun WiFi'ye bağlı olduğundan emin ol
2. Tarayıcının tam ekran modundan çık (Landscape mod dene)
3. Tarayıcıyı güncelle
4. JavaScript'in açık olduğundan emin ol

---

## 📞 Destek

**Sorun yaşıyorsanız:**
1. Bu rehber'i okuyun
2. Backend loglarını kontrol edin
3. Firestore console'unda veriyi kontrol edin
4. GitHub Issues'a hata raporu açın

**Faydalı Linkler:**
- 📚 [Firebase Dokümentasyonu](https://firebase.google.com/docs)
- 🐛 [GitHub Issues](https://github.com/HayrunnisaKoran/Smart_Etsy_Optimizer/issues)
- 📧 [Email Destek](mailto:support@etsy-optimizer.com)

---

**Bu rehber 18 Mayıs 2026 tarihinde hazırlanmıştır.**  
**Smart Etsy Optimizer v1.0.0**

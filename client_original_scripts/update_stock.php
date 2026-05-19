<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST"); // Stok güncelleme güvenlik için POST olmalı

// 1. Dışarıdan (React'tan veya Postman'den) gelen JSON gövdesini (Body) okuyoruz.
// PHP'de ham input verisini almak için 'php://input' kullanılır.
$rawInput = file_get_contents('php://input');
$updates = json_decode($rawInput, true); // true parametresi veriyi nesne yerine ilişkisel diziye çevirir.

// Eğer gelen veri boşsa veya dizi değilse hata döndür
if (!$updates || !is_array($updates)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Geçersiz veya boş veri formatı gönderildi."]);
    exit();
}

// 2. Başarı ve Hata durumlarını toplamak için boş listeler (Array) hazırlıyoruz
$successList = [];
$errorList = [];

// Mağazamızda var olan geçerli SKU kodları (Doğrulama simülasyonu için)
$allowedSkus = ["HCM-005", "HCM-012", "HCM-022", "HCM-054"];

// 3. Döngü ile gelen tüm stok güncellemelerini tek tek işliyoruz
foreach ($updates as $item) {
    $sku = isset($item['sku']) ? $item['sku'] : null;
    $newStock = isset($item['newStock']) ? $item['newStock'] : null;
    
    // Eksik veri kontrolü
    if (is_null($sku) || is_null($newStock)) {
        $errorList[] = [
            "sku" => $sku ?? "BİLİNMEYEN",
            "reason" => "SKU veya newStock parametresi eksik gönderildi."
        ];
        continue; // Bu ürünü atla, sonraki ürüne geç
    }

    // 4. Etsy API / Veritabanı Güncelleme Simülasyonu
    // Eğer gelen SKU bizim mağazamızda varsa başarılı sayıyoruz
    if (in_array($sku, $allowedSkus)) {
        
        // Burası gerçek üretimde Firebase veya Etsy API'ye istek atacağımız yerdir.
        $successList[] = [
            "sku" => $sku,
            "updated_stock" => $newStock,
            "status" => "Etsy mağazasında ve Firestore'da senkronize edildi."
        ];
        
    } else {
        // Eğer SKU sistemde yoksa, hoca/müşteri isteri gereği BAŞARISIZLAR listesine ekliyoruz
        $errorList[] = [
            "sku" => $sku,
            "new_stock_attempt" => $newStock,
            "reason" => "Bu SKU koduna ait bir ürün Etsy mağazasında bulunamadı (API Hatası: 404)."
        ];
    }
}

// 5. Sonuç Raporunu Döndürme
// Müşteri isterindeki "Başarısız ürünleri return etme" kuralına tam uyum sağlandı.
$finalResponse = [
    "status" => count($errorList) > 0 ? "partial_success" : "success",
    "timestamp" => date("Y-m-d H:i:s"),
    "results" => [
        "success" => $successList,
        "errors"  => $errorList
    ]
];

echo json_encode($finalResponse, JSON_PRETTY_PRINT);
?>
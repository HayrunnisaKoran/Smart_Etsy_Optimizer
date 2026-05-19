<?php
// 1. Tarayıcıya ve istemciye bu dosyanın bir JSON çıktısı üreteceğini bildiriyoruz.
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *"); // React veya dışarıdan erişim için CORS izni

// 2. Tarayıcıdan veya API isteğinden gelen URL parametrelerini (GET) yakalıyoruz.
// Örnek istek: fetch_sales.php?startDate=2026-05-01&endDate=2026-05-30
$startDateInput = isset($_GET['startDate']) ? $_GET['startDate'] : '2026-05-01';
$endDateInput = isset($_GET['endDate']) ? $_GET['endDate'] : '2026-05-30';

// Gelen tarih metinlerini PHP'nin rahatça karşılaştırabileceği Zaman Damgasına (Timestamp) çeviriyoruz.
$startTimestamp = strtotime($startDateInput);
$endTimestamp = strtotime($endDateInput);

// 3. Etsy API'den geliyormuş gibi simüle ettiğimiz Ham Veri Havuzu (Mock Veritabanı)
// PHP'de ilişkisel diziler (associative arrays) kullanılır.
$mockDatabase = [
    [
        "transaction_id" => "E-1001",
        "sku" => "HCM-005",
        "quantity_sold" => 3,
        "date" => "2026-05-05"
    ],
    [
        "transaction_id" => "E-1002",
        "sku" => "HCM-012",
        "quantity_sold" => 1,
        "date" => "2026-05-12"
    ],
    [
        "transaction_id" => "E-1003",
        "sku" => "HCM-005",
        "quantity_sold" => 5,
        "date" => "2026-05-25"
    ],
    [
        "transaction_id" => "E-1004",
        "sku" => "HCM-099",
        "quantity_sold" => 2,
        "date" => "2026-06-02" // Bu tarih filtrenin dışında kalmalı
    ]
];

// 4. Filtreleme ve İstenen Formatlama Algoritması
$filteredSales = [];

foreach ($mockDatabase as $sale) {
    $saleTimestamp = strtotime($sale['date']);
    
    // Eğer ürünün satış tarihi, istenen başlangıç ve bitiş tarihleri arasındaysa
    if ($saleTimestamp >= $startTimestamp && $saleTimestamp <= $endTimestamp) {
        
        // Müşterinin tam olarak istediği formattaki diziyi (Array) oluşturuyoruz
        $filteredSales[] = [
            "Transaction ID" => $sale['transaction_id'],
            "SKU"            => $sale['sku'],
            "Quantity Sold"  => $sale['quantity_sold'],
            "Fetched At"     => date("Y-m-d H:i:s") // İşlemin yapıldığı anlık zaman
        ];
    }
}

// 5. Sonucu hocanın istediği gibi JSON formatına çevirip ekrana basıyoruz.
echo json_encode([
    "status" => "success",
    "meta" => [
        "start_date" => date("Y-m-d", $startTimestamp),
        "end_date" => date("Y-m-d", $endTimestamp),
        "total_records" => count($filteredSales)
    ],
    "data" => $filteredSales
], JSON_PRETTY_PRINT);
?>
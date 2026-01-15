## İş Takip Modülü:

1. Kullanı iş yaptığı kurumu/kişiyi ekler.
   Kurum özellikleri (client):

- kurum adı
- kurum açıklaması
- varsa logosu (şu aşamada hep null değer girilecek ve arayüze bu eklenmeyecek. Çünkü depolama için uygulama bulunmadı)
- user id (hangi kullanıcıya ait olduğunu bilmek için)

2. Kişi kurumlardan/kişilerden aldığı işleri girebilir

Proje özellikleri (project)

- proje adı
- proje açıklaması
- client id (ilişki için)
- user id (hangi kullanıcıya ait olduğunu bilmek için)
- proje başlangıç tarihi (seçili olmak zorunda. Eğer kullanıcı seçmediyse işlem yapılan tarih olabilir)
- proje bitiş tarihi (seçili olmak zorunda değil. Her işin deadline'ı olmak zorunda değil.)
- proje ilerleyiş süreci (beklemede, duraklatıldı, iptal edildi, teslim edildi, revize bekliyor (karşı taraftan (client'dan) bir dönüş bekleniyorsa diye))
- fiyat
- ödeme durumu (ödeme yapıldı, ödeme bekliyor)
- projede kullanılan teknoloji ve kütüphaneler (nodejs, html, css, js gibi. Bunlar string olarak "," ile ayrılmış şekilde tutulabilir. Sadece gösterim olarak badge olacak çünkü)
- proje kategorisi (web projesi, admin paneli, dashboard design, ui design gibi)
- revizeler (burası integer olacak. revize diye bir tablo olacak. işe ait kaç tane revize verilmiş ve yapılmış bunlar tutulacak. bu yapı olmaya da bilir. bunu sana bırakıyorum.)

3. Kişi aldığı işler için revize oluşturabilir.

Bu oldukça basit düşünülecek. Sadece başlık ve açıklama şeklinde hatırlatıcı unsurlar olacak. Ben revizeleri döküman olarak tutuyorum. "Şurada şu döküman var vs şeklinde içerik yazılacak"

Eğer yapılabilirse (ki şu anda bunu çok düşünmüyorum) Google Docs ile bağlantı sağlanılacak ve kullanıcı oluşturduğu revize dökümanlarını sistem içinde docs olarak görüntüleyebilecek. Gerekli bir editör eklenebilir ama bunu şu anda düşünmüyorum.

Revizele Özellikleri (revise)

- title
- description
- user id (hangi kullanıcıya ait olduğunu bilmek için)
- project id (hangi iş için gerekli ilişki için)

4. Kullanıcı oluşturduğu işlere görev atayabilir.

Her işin kendine özgü süreçleri olabiliyor. Burası sanki task list / todo list benzeri bir yapıda olacak. Her iş için görev listesi oluşturabilirim.

Görev listesi özellikleri (task_list):

- title
- number (görev sırası için. Burası daha sonra her bir iş için düzenlenebilir olacak ayrıca.)
- user id (hangi kullanıcıya ait olduğunu bilmek için)
- project id (hangi iş için gerekli ilişki için)
- tamamlandı bilgisi (is_completed) (boolean olabilir. Arayüzde bir checkbox ile tamamlanıp tamamlanmadığını seçeceğim. O görevi yaptıysam check edeceğim)

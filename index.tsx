import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList, Image,
  SafeAreaView,
  ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';

// ✅ ต้องตรงกับโครงสร้าง products.json จริงบน GitHub ของคุณ
interface Product {
  id: string;
  name: string;
  stock: number;
  stock_text: string;
  category: string;
  location_count: number;
  location_text: string;
  badge_status: string; // "Active" | "Low in stock"
  Color?: string;
  image_url: string;
}

// 🔗 Raw URL ของ products.json บน GitHub (ตามสไลด์ข้อ 2)
const PRODUCTS_URL = 'https://raw.githubusercontent.com/panphailin-n/MyProfileAppPanphailin/refs/heads/main/products.json';

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // ✅ fetch() → response.json() → setProducts(data) ตามสไลด์หน้า 12
  const loadProducts = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await fetch(PRODUCTS_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products: ', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const [currentView, setCurrentView] = useState('home'); // 'home', 'add', 'detail'
  const [activeTab, setActiveTab] = useState('Products');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const [newName, setNewName] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newImage, setNewImage] = useState('');

  // ✅ ดึงหมวดหมู่จาก field "category" ของข้อมูลจริงแบบ dynamic
  // แก้ปัญหาหมวดหมู่ไม่ตรงกับสินค้าแบบถาวร ไม่ต้องแก้โค้ดเองทุกครั้งที่มีหมวดใหม่
  const categoriesList = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ['All', ...unique];
  }, [products]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = (product.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleMenuPress = (menuName: string) => {
    setActiveTab(menuName);
    setCurrentView(menuName === 'Add' ? 'add' : 'home');
  };

  const handleSaveProduct = () => {
    if (!newName || !newStock) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อและจำนวน stock ให้ครบ');
      return;
    }
    const stockNum = Number(newStock) || 0;
    const newProduct: Product = {
      id: Date.now().toString(),
      name: newName,
      stock: stockNum,
      stock_text: `${stockNum} in stock`,
      category: newCategory || 'Other',
      location_count: 1,
      location_text: '1 stores',
      badge_status: stockNum <= 3 ? 'Low in stock' : 'Active',
      image_url: newImage || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80',
    };
    setProducts([newProduct, ...products]);

    setNewName(''); setNewStock(''); setNewCategory(''); setNewImage('');
    setCurrentView('home');
    setActiveTab('Products');
  };

  const isLowStock = (status: string) => status?.toLowerCase().includes('low');

  // ==========================================
  // หน้าจอรายละเอียดสินค้า (DETAIL)
  // ==========================================
  if (currentView === 'detail' && selectedProduct) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => { setCurrentView('home'); setActiveTab('Products'); }}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <Image source={{ uri: selectedProduct.image_url }} style={styles.detailImage} resizeMode="cover" />
          <View style={styles.infoContainer}>
            <View style={styles.detailBadgeRow}>
              <Text style={styles.detailBrand}>{selectedProduct.category}</Text>
              <View style={[styles.badge, isLowStock(selectedProduct.badge_status) ? styles.badgeLow : styles.badgeActive]}>
                <Text style={[styles.badgeText, { color: isLowStock(selectedProduct.badge_status) ? colors.lowStock : colors.accent }]}>{selectedProduct.badge_status}</Text>
              </View>
            </View>
            <Text style={styles.detailName}>{selectedProduct.name}</Text>
            <Text style={styles.detailPrice}>{selectedProduct.stock_text}</Text>
            <Text style={styles.detailSub}>{selectedProduct.location_text} · {selectedProduct.location_count} branches</Text>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              นาฬิกาสมาร์ทวอทช์รุ่นล่าสุด {selectedProduct.name} ดีไซน์พรีเมียม ตอบโจทย์ทุกไลฟ์สไตล์ ติดตามสุขภาพแบบเรียลไทม์ ใช้งานได้ยาวนาน
            </Text>
          </View>
        </ScrollView>
        <BottomNav activeTab={activeTab} onPress={handleMenuPress} />
      </SafeAreaView>
    );
  }

  // ==========================================
  // หน้าจอเพิ่มสินค้า (ADD)
  // ==========================================
  if (currentView === 'add') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Product</Text>
        </View>
        <ScrollView style={styles.formContainer}>
          <Text style={styles.label}>Product Name</Text>
          <TextInput style={styles.input} placeholder="เช่น Apple Watch Ultra" value={newName} onChangeText={setNewName} />

          <Text style={styles.label}>Stock</Text>
          <TextInput style={styles.input} placeholder="เช่น 12" keyboardType="numeric" value={newStock} onChangeText={setNewStock} />

          <Text style={styles.label}>Category</Text>
          <TextInput style={styles.input} placeholder="เช่น Smartwatch" value={newCategory} onChangeText={setNewCategory} />

          <Text style={styles.label}>Image URL (ไม่ใส่ก็ได้)</Text>
          <TextInput style={styles.input} placeholder="https://..." value={newImage} onChangeText={setNewImage} />

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProduct}>
            <Text style={styles.saveButtonText}>Save Product</Text>
          </TouchableOpacity>
        </ScrollView>
        <BottomNav activeTab={activeTab} onPress={handleMenuPress} />
      </SafeAreaView>
    );
  }

  // ==========================================
  // หน้าจอหลัก (HOME)
  // ==========================================
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity><Text style={styles.menuIcon}>☰</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>SMARTWOW</Text>
        <TouchableOpacity style={styles.profileButton}><Text style={styles.profileIcon}>👤</Text></TouchableOpacity>
      </View>

      <View style={styles.actionRow}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput style={styles.searchInput} placeholder="Search watches..." placeholderTextColor="#999" value={searchQuery} onChangeText={setSearchQuery} />
        </View>
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categoriesList.map((cat) => (
            <TouchableOpacity key={cat} style={[styles.categoryBadge, activeCategory === cat && styles.categoryBadgeActive]} onPress={() => setActiveCategory(cat)}>
              <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>กำลังโหลดสินค้าจาก GitHub...</Text>
          </View>
        ) : hasError ? (
          <View style={styles.centerBox}>
            <Text style={styles.errorText}>โหลดข้อมูลไม่สำเร็จ ตรวจสอบ Raw URL หรืออินเทอร์เน็ต</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
              <Text style={styles.retryButtonText}>ลองใหม่</Text>
            </TouchableOpacity>
          </View>
        ) : filteredProducts.length > 0 ? (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.productCard} activeOpacity={0.7} onPress={() => { setSelectedProduct(item); setCurrentView('detail'); }}>
                <Image source={{ uri: item.image_url }} style={styles.productImage} resizeMode="cover" />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.productMeta}>{item.stock_text}</Text>
                  <Text style={styles.productMeta}>{item.category} · {item.location_text}</Text>
                  <View style={[styles.badge, isLowStock(item.badge_status) ? styles.badgeLow : styles.badgeActive]}>
                    <Text style={[styles.badgeText, { color: isLowStock(item.badge_status) ? colors.lowStock : colors.accent }]}>{item.badge_status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={styles.emptyText}>ไม่พบสินค้าที่คุณค้นหา</Text>
        )}
      </View>

      <BottomNav activeTab={activeTab} onPress={handleMenuPress} />
    </SafeAreaView>
  );
}

const BottomNav = ({ activeTab, onPress }: { activeTab: string; onPress: (menu: string) => void }) => (
  <View style={styles.bottomNav}>
    <TouchableOpacity style={styles.navItem} onPress={() => onPress('Home')}>
      <Text style={[styles.navIcon, activeTab === 'Home' && styles.activeNavColor]}>🏠</Text>
      <Text style={[styles.navText, activeTab === 'Home' && styles.activeNavColor]}>Home</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={() => onPress('Add')}>
      <Text style={[styles.navIcon, activeTab === 'Add' && styles.activeNavColor]}>➕</Text>
      <Text style={[styles.navText, activeTab === 'Add' && styles.activeNavColor]}>Add</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={() => onPress('Products')}>
      <Text style={[styles.navIcon, activeTab === 'Products' && styles.activeNavColor]}>⌚</Text>
      <Text style={[styles.navText, activeTab === 'Products' && styles.activeNavColor]}>Products</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={() => onPress('Categories')}>
      <Text style={[styles.navIcon, activeTab === 'Categories' && styles.activeNavColor]}>📁</Text>
      <Text style={[styles.navText, activeTab === 'Categories' && styles.activeNavColor]}>Categories</Text>
    </TouchableOpacity>
  </View>
);

// 🎨 Design tokens
const colors = {
  bg: '#F6F7FB',
  surface: '#FFFFFF',
  border: '#E7E9F2',
  textPrimary: '#14161F',
  textSecondary: '#767B8C',
  textMuted: '#A0A4B4',
  accent: '#5B5FEF',
  accentSoft: '#EEEEFD',
  mint: '#00C2A8',
  lowStock: '#E0507A', // สีสำหรับ badge "Low in stock"
  lowStockSoft: '#FDEBF0',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 45 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 18 },
  menuIcon: { fontSize: 22, color: colors.textPrimary },
  headerTitle: { fontSize: 19, fontWeight: '800', color: colors.textPrimary, letterSpacing: 3 },
  profileButton: { backgroundColor: colors.accent, width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', shadowColor: colors.accent, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  profileIcon: { color: '#fff', fontSize: 16 },

  actionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 14, height: 48, shadowColor: '#1B1F3B', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  searchIcon: { marginRight: 8, fontSize: 16, opacity: 0.6 },
  searchInput: { flex: 1, height: 48, outlineStyle: 'none', color: colors.textPrimary as any, fontSize: 14 },

  categoryContainer: { paddingBottom: 18 },
  categoryScroll: { paddingHorizontal: 15, gap: 8 },
  categoryBadge: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22, backgroundColor: colors.surface, marginLeft: 5, borderWidth: 1, borderColor: colors.border },
  categoryBadgeActive: { backgroundColor: colors.accent, borderColor: colors.accent, shadowColor: colors.accent, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  categoryText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  categoryTextActive: { color: '#fff' },

  content: { flex: 1 },
  emptyText: { textAlign: 'center', marginTop: 50, color: colors.textMuted, fontSize: 15 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  loadingText: { marginTop: 12, color: colors.textSecondary, fontSize: 14 },
  errorText: { textAlign: 'center', color: colors.textSecondary, fontSize: 14, marginBottom: 16, lineHeight: 20 },
  retryButton: { backgroundColor: colors.accent, paddingHorizontal: 26, paddingVertical: 13, borderRadius: 12, shadowColor: colors.accent, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  retryButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  listContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  productCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 20, margin: 6, padding: 12, shadowColor: '#1B1F3B', shadowOpacity: 0.07, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  productImage: { width: '100%', height: 110, borderRadius: 14, marginBottom: 10, backgroundColor: colors.accentSoft },
  productInfo: { paddingHorizontal: 2 },
  productName: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 4, minHeight: 34 },
  productMeta: { fontSize: 11.5, color: colors.textSecondary, marginBottom: 3 },

  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 6 },
  badgeActive: { backgroundColor: colors.accentSoft },
  badgeLow: { backgroundColor: colors.lowStockSoft },
  badgeText: { fontSize: 10.5, fontWeight: '800', color: colors.textPrimary },

  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16, backgroundColor: colors.surface, borderTopWidth: 1, borderColor: colors.border, shadowColor: '#1B1F3B', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 4 },
  navItem: { alignItems: 'center' },
  navIcon: { fontSize: 21, marginBottom: 4, opacity: 0.5 },
  navText: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  activeNavColor: { color: colors.accent, fontWeight: '800', opacity: 1 },

  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', shadowColor: '#1B1F3B', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  backIcon: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  detailImage: { width: '100%', height: 350, backgroundColor: colors.accentSoft },
  infoContainer: { padding: 20, backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -24 },
  detailBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  detailBrand: { fontSize: 13, color: colors.accent, textTransform: 'uppercase', fontWeight: '800', letterSpacing: 1.5 },
  detailName: { fontSize: 25, fontWeight: '800', color: colors.textPrimary, marginBottom: 6 },
  detailPrice: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  detailSub: { fontSize: 13, color: colors.textSecondary, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginTop: 6, marginBottom: 10 },
  description: { fontSize: 14, color: colors.textSecondary, lineHeight: 23 },

  formContainer: { padding: 20, flex: 1 },
  label: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, height: 52, fontSize: 14, color: colors.textPrimary, outlineStyle: 'none' as any },
  saveButton: { backgroundColor: colors.accent, paddingVertical: 17, borderRadius: 14, alignItems: 'center', marginTop: 32, marginBottom: 50, shadowColor: colors.accent, shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

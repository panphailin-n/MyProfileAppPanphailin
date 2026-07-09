import React, { useState } from 'react';
import {
  StyleSheet, Text, TextInput, TouchableOpacity, View,
  SafeAreaView, FlatList, Image, ScrollView, Alert
} from 'react-native';

const categoriesList = ['All', 'Apple', 'Samsung', 'Garmin', 'Amazfit'];

export default function HomeScreen() {
  // 1. ฐานข้อมูลสินค้า
  const [products, setProducts] = useState([
    { id: '1', name: 'Apple Watch Series 11 GPS Space', price: '15900', brand: 'Apple', image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=300&q=80' },
    { id: '2', name: 'Samsung Galaxy Watch7 AI', price: '10900', brand: 'Samsung', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=300&q=80' },
    { id: '3', name: 'Garmin Venu 3 Series', price: '15990', brand: 'Garmin', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=300&q=80' },
    { id: '4', name: 'Amazfit Active', price: '4490', brand: 'Amazfit', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80' },
  ]);

  // 2. State ควบคุมหน้าจอและการค้นหา
  const [currentView, setCurrentView] = useState('home'); // 'home', 'add', 'detail'
  const [activeTab, setActiveTab] = useState('Products'); // ไว้เปลี่ยนสีเมนูด้านล่าง
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // 3. State สำหรับเพิ่มสินค้าใหม่
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newImage, setNewImage] = useState('');

  // กรองสินค้าตามที่ค้นหาและหมวดหมู่
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.brand === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ฟังก์ชันสลับเมนูด้านล่าง
  const handleMenuPress = (menuName: string) => {
    setActiveTab(menuName);
    if (menuName === 'Add') {
      setCurrentView('add');
    } else {
      setCurrentView('home'); // Home, Products, Categories ให้กลับมาหน้าหลัก
    }
  };

  // ฟังก์ชันบันทึกสินค้า
  const handleSaveProduct = () => {
    if (!newName || !newPrice) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อและราคาให้ครบ');
      return;
    }
    const newProduct = {
      id: Date.now().toString(),
      name: newName,
      price: newPrice,
      brand: newBrand || 'Other',
      image: newImage || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80'
    };
    setProducts([newProduct, ...products]); 
    
    // เคลียร์ค่าและกลับหน้าหลัก
    setNewName(''); setNewPrice(''); setNewBrand(''); setNewImage('');
    setCurrentView('home');
    setActiveTab('Products');
  };

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
        <ScrollView showsVerticalScrollIndicator={false}>
          <Image source={{ uri: selectedProduct.image }} style={styles.detailImage} />
          <View style={styles.infoContainer}>
            <Text style={styles.detailBrand}>{selectedProduct.brand}</Text>
            <Text style={styles.detailName}>{selectedProduct.name}</Text>
            <Text style={styles.detailPrice}>฿{Number(selectedProduct.price).toLocaleString()}</Text>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              นาฬิกาสมาร์ทวอทช์รุ่นล่าสุด {selectedProduct.name} ดีไซน์พรีเมียม ตอบโจทย์ทุกไลฟ์สไตล์ ติดตามสุขภาพแบบเรียลไทม์ ใช้งานได้ยาวนาน
            </Text>
          </View>
        </ScrollView>
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
          
          <Text style={styles.label}>Price (฿)</Text>
          <TextInput style={styles.input} placeholder="เช่น 25000" keyboardType="numeric" value={newPrice} onChangeText={setNewPrice} />
          
          <Text style={styles.label}>Brand</Text>
          <TextInput style={styles.input} placeholder="เช่น Apple" value={newBrand} onChangeText={setNewBrand} />
          
          <Text style={styles.label}>Image URL (ไม่ใส่ก็ได้)</Text>
          <TextInput style={styles.input} placeholder="https://..." value={newImage} onChangeText={setNewImage} />

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProduct}>
            <Text style={styles.saveButtonText}>Save Product</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* นำ Bottom Nav มาโชว์ในหน้า Add ด้วย */}
        <BottomNav activeTab={activeTab} onPress={handleMenuPress} />
      </SafeAreaView>
    );
  }

  // ==========================================
  // หน้าจอหลัก (HOME)
  // ==========================================
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity><Text style={styles.menuIcon}>☰</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>SMARTWOW</Text>
        <TouchableOpacity style={styles.profileButton}><Text style={styles.profileIcon}>👤</Text></TouchableOpacity>
      </View>

      {/* ค้นหา */}
      <View style={styles.actionRow}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput style={styles.searchInput} placeholder="Search watches..." placeholderTextColor="#999" value={searchQuery} onChangeText={setSearchQuery} />
        </View>
      </View>

      {/* หมวดหมู่ */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categoriesList.map((cat) => (
            <TouchableOpacity key={cat} style={[styles.categoryBadge, activeCategory === cat && styles.categoryBadgeActive]} onPress={() => setActiveCategory(cat)}>
              <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* รายการสินค้า */}
      <View style={styles.content}>
        {filteredProducts.length > 0 ? (
          <FlatList 
            data={filteredProducts} 
            keyExtractor={(item) => item.id} 
            numColumns={2} 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.productCard} activeOpacity={0.7} onPress={() => { setSelectedProduct(item); setCurrentView('detail'); }}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.productPrice}>฿{Number(item.price).toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
            )} 
          />
        ) : (
          <Text style={styles.emptyText}>ไม่พบสินค้าที่คุณค้นหา</Text>
        )}
      </View>

      {/* เมนูด้านล่าง 4 ปุ่ม */}
      <BottomNav activeTab={activeTab} onPress={handleMenuPress} />
    </SafeAreaView>
  );
}

// คอมโพเนนต์เมนูด้านล่าง (แยกออกมาเพื่อให้เรียกใช้ง่ายๆ)
const BottomNav = ({ activeTab, onPress }: any) => (
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

// ==========================================
// สไตล์ทั้งหมด
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', paddingTop: 45 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15 },
  menuIcon: { fontSize: 22, color: '#000' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#000', letterSpacing: 2 },
  profileButton: { backgroundColor: '#000', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  profileIcon: { color: '#fff', fontSize: 16 },
  
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#EAEAEA' },
  searchIcon: { marginRight: 8, fontSize: 16 },
  searchInput: { flex: 1, height: 44, outlineStyle: 'none', color: '#000' },
  
  categoryContainer: { paddingBottom: 15 },
  categoryScroll: { paddingHorizontal: 15, gap: 8 },
  categoryBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAEAEA', marginLeft: 5 },
  categoryBadgeActive: { backgroundColor: '#000', borderColor: '#000' },
  categoryText: { fontSize: 13, fontWeight: '600', color: '#666' },
  categoryTextActive: { color: '#fff' },
  
  content: { flex: 1 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 },
  listContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  productCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, margin: 6, padding: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  productImage: { width: '100%', height: 120, borderRadius: 10, resizeMode: 'cover', marginBottom: 12 },
  productInfo: { paddingHorizontal: 2 },
  productName: { fontSize: 13, fontWeight: '700', color: '#111', marginBottom: 6, minHeight: 36 },
  productPrice: { fontSize: 15, fontWeight: '900', color: '#000' },
  
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#EAEAEA' },
  navItem: { alignItems: 'center' },
  navIcon: { fontSize: 22, marginBottom: 4 },
  navText: { fontSize: 11, color: '#999', fontWeight: '600' },
  activeNavColor: { color: '#000', fontWeight: '900' }, // เพิ่มความเข้มเวลาเลือกเมนู

  // สไตล์สำหรับ Detail และ Add
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEA' },
  backIcon: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  detailImage: { width: '100%', height: 350, resizeMode: 'cover' },
  infoContainer: { padding: 20 },
  detailBrand: { fontSize: 14, color: '#666', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 5 },
  detailName: { fontSize: 24, fontWeight: '900', color: '#000', marginBottom: 10 },
  detailPrice: { fontSize: 22, fontWeight: 'bold', color: '#000', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#000', marginTop: 10, marginBottom: 10 },
  description: { fontSize: 14, color: '#666', lineHeight: 22 },
  
  formContainer: { padding: 20, flex: 1 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#000', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 10, paddingHorizontal: 15, height: 50, fontSize: 14, outlineStyle: 'none' },
  saveButton: { backgroundColor: '#000', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 30, marginBottom: 50 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
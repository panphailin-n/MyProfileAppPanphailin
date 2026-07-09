import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    // คำสั่งนี้คือเวทมนตร์ ปิดหัว Expo ทิ้งถาวรทุกหน้า!
    <Stack screenOptions={{ headerShown: false }} />
  );
}
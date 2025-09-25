import { Stack } from 'expo-router';

export default function SellerLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="dashboard"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create-course"
        options={{
          title: 'Yangi kurs yaratish',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="edit-course/[id]"
        options={{
          title: 'Kursni tahrirlash',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="analytics"
        options={{
          title: 'Statistika',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
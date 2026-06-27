import { Redirect } from 'expo-router';

// Ruta heredada del template. Redirige al lienzo para no romper imports.
export default function Explore() {
  return <Redirect href="/" />;
}

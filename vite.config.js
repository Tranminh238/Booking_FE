

// const App =()=>{
//     return(
//         <div>
//             <h1>App</h1>
//         </div>
//     )
// }

// export default App
import React from "react";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
  server: {
    port: 3000
  }
})
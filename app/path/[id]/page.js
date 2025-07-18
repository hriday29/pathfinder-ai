// // app/path/[id]/page.js

// import Header from "../../../components/Header";
// import PathStep from "../../../components/PathStep";

// async function getPathData(id) {
//   // We fetch data from our own API route.
//   // The NEXT_PUBLIC_BASE_URL should be http://localhost:3000 for development.
//   const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/path/${id}`, { cache: 'no-store' });
  
//   if (!res.ok) {
//     throw new Error('Failed to fetch path data');
//   }
//   return res.json();
// }

// export default async function PathPage({ params }) {
//   const { path } = await getPathData(params.id);

//   return (
//     <div className="text-white flex flex-col min-h-screen antialiased">
//       <Header />
//       <main className="container mx-auto p-4 sm:p-6 flex-grow">
//         <div className="max-w-3xl mx-auto">
//           <h1 className="text-4xl font-black tracking-tighter mb-2">Your Path to Master <span className="text-zinc-400">{path.topic}</span></h1>
//           <p className="text-zinc-400 mb-8">Generated on {new Date(path.createdAt).toLocaleDateString()}</p>
          
//           <div className="space-y-4">
//             {path.path.path.map((step, index) => (
//               <PathStep key={index} step={step} index={index} />
//             ))}
//           </div>
//         </div>
//       </main>
//       <footer className="p-4 sm:p-6 text-center text-zinc-600 text-sm z-10 container mx-auto">
//         <p>&copy; 2025 Pathfinder AI. All Rights Reserved.</p>
//       </footer>
//     </div>
//   );
// }

import Header from "../../../components/Header";
import PathStep from "../../../components/PathStep";

// This function fetches the data for a specific path from our API route
async function getPathData(id) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/path/${id}`, { 
    cache: 'no-store' 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch path data');
  }
  return res.json();
}

// This is a Server Component that fetches data before rendering
export default async function PathPage({ params }) {
  const { path } = await getPathData(params.id);

  return (
    <div className="text-white flex flex-col min-h-screen antialiased">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 flex-grow">
        <div className="max-w-3xl mx-auto">
          {/* Page Header */}
          <h1 className="text-4xl font-black tracking-tighter mb-2">
            Your Path to Master <span className="text-zinc-400">{path.topic}</span>
          </h1>
          <p className="text-zinc-400 mb-8">
            Generated on {new Date(path.createdAt).toLocaleDateString()}
          </p>
          
          {/* Renders the list of path steps */}
          <div className="space-y-4">
            {/* THE FIX IS HERE: Changed path.path.path.map to path.path.map */}
            {path.path.map((step, index) => (
              <PathStep key={index} step={step} index={index} />
            ))}
          </div>
        </div>
      </main>
      <footer className="p-4 sm:p-6 text-center text-zinc-600 text-sm z-10 container mx-auto">
        <p>&copy; 2025 Pathfinder AI. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

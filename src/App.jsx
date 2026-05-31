// src/App.jsx
import React, { useState, useEffect } from 'react';
import { ReactReader } from 'react-reader';
import localforage from 'localforage';

function App() {
  const [vistaActual, setVistaActual] = useState('estante'); 
  const [cargando, setCargando] = useState(true); // Pantalla de carga mística
  
  // Categorías del Grimorio
  const categoriasGrimorio = ['Diario Mágico', 'Hechizos', 'Pociones', 'Astrología', 'Ideas FA'];
  const [categoriaActiva, setCategoriaActiva] = useState(categoriasGrimorio[0]);
  const [hechizos, setHechizos] = useState([]);
  const [nuevoHechizo, setNuevoHechizo] = useState('');
  
  // Libros Externos y Lector
  const [librosExtras, setLibrosExtras] = useState([]);
  const [libroAbierto, setLibroAbierto] = useState(null);
  const [ubicacionEpub, setUbicacionEpub] = useState(null);

  // 1. DESPERTAR EL GRIMORIO: Cargar datos guardados al abrir la app
  useEffect(() => {
    const invocarMemoria = async () => {
      try {
        const hechizosGuardados = await localforage.getItem('fa-hechizos');
        if (hechizosGuardados) setHechizos(hechizosGuardados);

        const librosGuardados = await localforage.getItem('fa-libros');
        if (librosGuardados) {
          // Reconstruir las URLs para los archivos físicos guardados
          const librosListos = librosGuardados.map(libro => ({
            ...libro,
            url: URL.createObjectURL(libro.archivo)
          }));
          setLibrosExtras(librosListos);
        }
      } catch (error) {
        console.error("Interferencia al leer la memoria:", error);
      }
      setCargando(false);
    };
    invocarMemoria();
  }, []);

  // 2. GUARDAR HECHIZOS PERMANENTEMENTE
  const manejarAgregarHechizo = async () => {
    if (!nuevoHechizo.trim()) return;
    const nuevoItem = { id: Date.now(), categoria: categoriaActiva, texto: nuevoHechizo };
    const nuevaLista = [...hechizos, nuevoItem];
    
    setHechizos(nuevaLista);
    setNuevoHechizo('');
    
    // Sellar en la base de datos
    await localforage.setItem('fa-hechizos', nuevaLista);
  };

  // 3. GUARDAR LIBROS (PDF/EPUB) PERMANENTEMENTE
  const manejarSubirLibro = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const nombreMin = file.name.toLowerCase();
      const esEpub = nombreMin.endsWith('.epub');
      const esPdf = nombreMin.endsWith('.pdf');
      
      const nuevoLibroGuardar = {
        id: Date.now(),
        nombre: file.name,
        esEpub: esEpub,
        esPdf: esPdf,
        archivo: file // Guardamos el archivo real en la base de datos, no la URL
      };

      // Limpiamos los datos para guardarlos (sin la URL temporal que se rompe al cerrar la app)
      const librosParaGuardar = [...librosExtras.map(l => ({id: l.id, nombre: l.nombre, esEpub: l.esEpub, esPdf: l.esPdf, archivo: l.archivo})), nuevoLibroGuardar];
      await localforage.setItem('fa-libros', librosParaGuardar);

      // Creamos la URL solo para mostrarlo ahora mismo
      const nuevoLibroMostrar = {
        ...nuevoLibroGuardar,
        url: URL.createObjectURL(file)
      };
      setLibrosExtras([...librosExtras, nuevoLibroMostrar]);
    }
  };

  const hechizosFiltrados = hechizos.filter(h => h.categoria === categoriaActiva);

  // Pantalla de carga mientras lee la base de datos
  if (cargando) {
    return <div style={{ color: '#e2c073', textAlign: 'center', marginTop: '40vh', fontFamily: 'Cinzel Decorative', fontSize: '24px' }}>Despertando la Magia...</div>;
  }

  return (
    <div className="bookshelf-container">
      
      {/* VISTA 1: LA ESTANTERÍA */}
      {vistaActual === 'estante' && (
        <>
          <h1 className="shelf-title">Biblioteca de las Sombras</h1>
          <div className="shelf">
            <div className="book grimoire" onClick={() => setVistaActual('grimorio')}></div>
            
            {librosExtras.map((libro) => (
              <div 
                key={libro.id} 
                className="book user-file"
                onClick={() => {
                  setLibroAbierto(libro);
                  setVistaActual('lectorExterno');
                }}
              >
                <div className="book-text-title">{libro.nombre.substring(0, 15)}...</div>
              </div>
            ))}
          </div>

          <label htmlFor="upload-shelf" className="magic-upload-btn">
            ✦ Invocar Archivo (PDF/EPUB) ✦
          </label>
          <input type="file" id="upload-shelf" accept=".pdf,.epub,image/*" style={{ display: 'none' }} onChange={manejarSubirLibro} />
        </>
      )}

      {/* VISTA 2: EL GRIMORIO CON TEMAS */}
      {vistaActual === 'grimorio' && (
        <div className="reader-modal">
          <button className="close-btn" onClick={() => setVistaActual('estante')}>✕</button>
          <div className="book-open-container">
            <div className="book-sidebar">
              <h3 className="sidebar-title">Índice Mágico</h3>
              <ul className="category-list">
                {categoriasGrimorio.map(cat => (
                  <li 
                    key={cat} 
                    className={`category-item ${categoriaActiva === cat ? 'active' : ''}`}
                    onClick={() => setCategoriaActiva(cat)}
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            </div>
            <div className="book-content-area">
              <h2 className="content-header">{categoriaActiva}</h2>
              <div style={{ flex: 1 }}>
                {hechizosFiltrados.map(item => (
                  <div key={item.id} className="spell-entry">{item.texto}</div>
                ))}
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <textarea 
                  style={{ width: '100%', height: '80px', background: 'transparent', border: '2px dashed #4a0d0d', padding: '10px', fontFamily: 'Almendra', color: '#2b1a11' }}
                  placeholder={`Inscribe conocimiento en ${categoriaActiva}...`}
                  value={nuevoHechizo}
                  onChange={(e) => setNuevoHechizo(e.target.value)}
                />
                <button 
                  onClick={manejarAgregarHechizo}
                  style={{ background: '#4a0d0d', color: '#e2c073', border: 'none', padding: '10px 20px', cursor: 'pointer', fontFamily: 'Cinzel Decorative' }}
                >
                  Sellar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 3: LECTOR DE LIBROS EXTERNOS (PDF / EPUB / IMÁGENES) */}
      {vistaActual === 'lectorExterno' && libroAbierto && (
        <div className="reader-modal">
          <button className="close-btn" onClick={() => setVistaActual('estante')} style={{ zIndex: 9999 }}>✕</button>
          <div className="book-open-container" style={{ position: 'relative' }}>
            
            <div className="book-content-area" style={{ padding: 0, backgroundColor: '#fff', width: '100%', height: '100%' }}>
              
              {libroAbierto.esEpub ? (
                <div style={{ position: 'relative', height: '100%' }}>
                  <ReactReader
                    url={libroAbierto.url}
                    title={libroAbierto.nombre}
                    location={ubicacionEpub}
                    locationChanged={(epubcifi) => setUbicacionEpub(epubcifi)}
                    epubOptions={{ flow: 'scrolled', manager: 'continuous' }}
                  />
                </div>
              ) : 
              
              libroAbierto.esPdf ? (
                <iframe src={libroAbierto.url} className="pdf-viewer" title={libroAbierto.nombre} style={{ width: '100%', height: '100%', border: 'none' }}></iframe>
              ) : 
              
              (
                <div style={{ padding: '20px', textAlign: 'center', height: '100%', overflowY: 'auto' }}>
                  <img src={libroAbierto.url} alt="Contenido" style={{ maxWidth: '100%' }} />
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
        

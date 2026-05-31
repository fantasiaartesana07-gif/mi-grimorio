// src/App.jsx
import React, { useState, useEffect } from 'react';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [hechizos, setHechizos] = useState([]);
  const [nuevoHechizo, setNuevoHechizo] = useState('');
  const [imagenB64, setImagenB64] = useState('');
  const [librosExtras, setLibrosExtras] = useState([]);

  // Cargar datos guardados del almacenamiento interno al abrir la app
  useEffect(() => {
    const hechizosGuardados = localStorage.getItem('mis-hechizos');
    if (hechizosGuardados) setHechizos(JSON.parse(hechizosGuardados));

    const librosGuardados = localStorage.getItem('mis-libros-extras');
    if (librosGuardados) setLibrosExtras(JSON.parse(librosGuardados));
  }, []);

  // Guardar hechizos automáticamente cuando cambian
  const guardarEnStorage = (nuevosHechizos) => {
    setHechizos(nuevosHechizos);
    localStorage.setItem('mis-hechizos', JSON.stringify(nuevosHechizos));
  };

  // Agregar texto e imágenes al grimorio
  const manejarAgregarHechizo = () => {
    if (!nuevoHechizo.trim() && !imagenB64) return;

    const nuevoItem = {
      id: Date.now(),
      texto: nuevoHechizo,
      imagen: imagenB64 // Guarda la foto del celular aquí
    };

    const listaActualizada = [...hechizos, nuevoItem];
    guardarEnStorage(listaActualizada);

    // Limpiar campos del formulario
    setNuevoHechizo('');
    setImagenB64('');
  };

  // Procesar imágenes cargadas desde la galería del cel
  const manejarImagen = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenB64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Conjurar un nuevo libro en la estantería externa
  const manejarSubirLibroEstante = (e) => {
    const files = Array.from(e.target.files);
    const nuevosLibros = files.map(file => ({
      id: Date.now() + Math.random(),
      nombre: file.name
    }));

    const listaLibrosActualizada = [...librosExtras, ...nuevosLibros];
    setLibrosExtras(listaLibrosActualizada);
    localStorage.setItem('mis-libros-extras', JSON.stringify(listaLibrosActualizada));
  };

  return (
    <div className="bookshelf-container">
      <h1 className="shelf-title">Fada Artesana <br/>• Grimorio Antiguo •</h1>

      {/* LA ESTANTERÍA MÍSTICA */}
      <div className="shelf">
        {/* Grimorio Principal */}
        <div className="book grimoire" onClick={() => setIsOpen(true)} title="Abrir Grimorio"></div>
        
        {/* Libros dinámicos agregados desde el dispositivo */}
        {librosExtras.map((libro) => (
          <div key={libro.id} className="book user-file">
            <div className="book-text-title">{libro.nombre.substring(0, 20)}</div>
          </div>
        ))}
      </div>

      {/* Botón para añadir libros a la estantería */}
      <label htmlFor="upload-shelf" className="magic-upload-btn">
        📂 Conjurar Libro al Estante
      </label>
      <input 
        type="file" 
        id="upload-shelf" 
        multiple 
        style={{ display: 'none' }} 
        onChange={manejarSubirLibroEstante}
      />

      {/* EL GRIMORIO INTERACTIVO (PANTALLA COMPLETA) */}
      {isOpen && (
        <div className="book-modal">
          <button className="close-btn" onClick={() => setIsOpen(false)}>✕ Cerrar</button>
          
          <div className="grimorio-abierto">
            <div className="grimorio-header">
              <h2>Libro de Sombras & Hechizos</h2>
            </div>

            <div className="grimorio-body">
              {hechizos.length === 0 ? (
                <p style={{ textAlign: 'center', fontStyle: 'italic', opacity: 0.7 }}>
                  El grimorio está en blanco. Escribe tu primer secreto abajo...
                </p>
              ) : (
                hechizos.map((item) => (
                  <div key={item.id} className="spell-entry">
                    {item.texto && <p>{item.texto}</p>}
                    {item.imagen && <img src={item.imagen} alt="Encantamiento" className="spell-img" />}
                  </div>
                ))
              )}
            </div>

            {/* Formulario de anotaciones */}
            <div className="grimorio-footer">
              <textarea 
                placeholder="Escribe un nuevo encantamiento, poción o nota..."
                value={nuevoHechizo}
                onChange={(e) => setNuevoHechizo(e.target.value)}
              />
              
              <div className="action-row">
                <label htmlFor="upload-spell-img" className="icon-label" title="Añadir Imagen mística">
                  📷 {imagenB64 ? "✓" : ""}
                </label>
                <input 
                  type="file" 
                  id="upload-spell-img" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={manejarImagen}
                />

                <button className="btn-add-spell" onClick={manejarAgregarHechizo}>
                  Inscribir Hechizo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

import React from 'react';

export default function CitasPage() {
  const citas = [
    { id: 101, fecha: "15 Mar 2026", hora: "10:00 AM", motivo: "Vacunación Anual", mascota: "Luna" },
    { id: 102, fecha: "22 Mar 2026", hora: "04:30 PM", motivo: "Revisión General", mascota: "Rocky" }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Mis Citas</h1>
      <p className="text-slate-500 mb-8">Gestiona las citas programadas para tus mascotas.</p>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-700">Mascota</th>
              <th className="p-4 font-semibold text-slate-700">Fecha y Hora</th>
              <th className="p-4 font-semibold text-slate-700">Motivo_Consulta</th>
              <th className="p-4 font-semibold text-slate-700">Acción</th>
            </tr>
          </thead>
          <tbody>
            {citas.map((cita) => (
              <tr key={cita.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-blue-600">{cita.mascota}</td>
                <td className="p-4 text-slate-600">{cita.fecha} - {cita.hora}</td>
                <td className="p-4 text-slate-600">{cita.motivo}</td>
                <td className="p-4">
                  <button className="text-red-500 hover:underline font-medium text-sm">
                    cancelar_cita()
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <button className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-shadow shadow-lg">
        + generarCita()
      </button>
    </div>
  );
}
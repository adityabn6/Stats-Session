import React from 'react'
import RoadNotTaken from './components/RoadNotTaken'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          The Road Not Taken - Bernoulli Distribution Visualization
        </h1>
        <div className="flex justify-center">
          <RoadNotTaken />
        </div>
      </div>
    </div>
  )
}

export default App

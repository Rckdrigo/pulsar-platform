import Header from './components/Header'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <>
      <Header />
      <main className="main-content">
        <div className="empty-state">
          <h1>Coming Soon</h1>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default App

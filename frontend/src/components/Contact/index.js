import Navbar from '../Navbar'
import './index.css'

const contactList = [
  {
    id: 'C1',
    name: 'Yaswanth',
    role: 'Full Stack Developer',
    phone: '+91 90000 00000',
  },
  {
    id: 'C2',
    name: 'Collaborator',
    role: 'ML Engineer',
    phone: '+91 90000 00001',
  },
]

const Contact = () => (
  <div className="page-container">
    <Navbar />
    <div className="content-container">
      <h1 className="section-heading">Contact Us</h1>
      <div className="contact-list">
        {contactList.map(person => (
          <div className="contact-card" key={person.id}>
            <p className="contact-name">{person.name}</p>
            <p className="contact-role">{person.role}</p>
            <p className="contact-phone">{person.phone}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default Contact

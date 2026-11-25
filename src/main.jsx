
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Home, ListTodo, CalendarDays, BookOpen, Search, Plus,
  ChevronRight, ChevronLeft, Check, X, Trash2, Circle,
  CheckCircle2, Sparkles
} from 'lucide-react'
import './style.css'

const iso = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`
}

const plusDays = (n) => {
  const d = new Date()
  d.setDate(d.getDate()+n)
  return iso(d)
}

const seedTasks = [
  {id:1,title:'Latihan soal kalkulus',course:'Kalkulus',due:plusDays(1),priority:'High',done:false,notes:'Kerjakan latihan soal.'},
  {id:2,title:'Praktikum Alpro',course:'Alpro Lab',due:plusDays(2),priority:'Medium',done:false,notes:''},
  {id:3,title:'Review materi statistika',course:'Statistika',due:plusDays(3),priority:'Low',done:false,notes:''},
  {id:4,title:'Tugas Pancasila',course:'Pancasila',due:plusDays(5),priority:'Medium',done:false,notes:''},
  {id:5,title:'Personal goals',course:'Personal',due:plusDays(7),priority:'Low',done:true,notes:''}
]

const seedEvents = [
  {id:11,title:'Kalkulus',course:'Kalkulus',date:plusDays(0),start:'08:00',end:'09:40',place:'TULT',color:'purple',repeat:'none'},
  {id:12,title:'Alpro Lab',course:'Alpro Lab',date:plusDays(0),start:'10:00',end:'11:40',place:'TULT',color:'green',repeat:'none'},
  {id:13,title:'Statistika',course:'Statistika',date:plusDays(0),start:'13:00',end:'14:40',place:'TULT',color:'amber',repeat:'none'},
  {id:14,title:'Personal Time',course:'Personal',date:plusDays(0),start:'15:30',end:'16:30',place:'Free time',color:'rose',repeat:'none'},
  {id:15,title:'Pekar',course:'Pekar',date:plusDays(1),start:'09:00',end:'10:40',place:'TULT',color:'green',repeat:'none'}
]

const seedCourses = [
  {id:21,name:'Kalkulus',code:'',lecturer:'',room:'TULT',color:'purple'},
  {id:22,name:'Pekar',code:'',lecturer:'',room:'TULT',color:'green'},
  {id:23,name:'Alpro Lab',code:'',lecturer:'',room:'TULT',color:'amber'},
  {id:24,name:'Alpro Dosen',code:'',lecturer:'',room:'TULT',color:'rose'},
  {id:25,name:'Statistika',code:'',lecturer:'',room:'TULT',color:'slate'},
  {id:26,name:'Logika Matematika',code:'',lecturer:'',room:'TULT',color:'purple'},
  {id:27,name:'Agama Islam',code:'',lecturer:'',room:'TULT',color:'green'},
  {id:28,name:'Pancasila',code:'',lecturer:'',room:'TULT',color:'amber'},
  {id:29,name:'Personal',code:'',lecturer:'',room:'',color:'rose'}
]

function useStored(key, initial) {
  const [value,setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key,value])

  return [value,setValue]
}

const fmtDate = (value, opts={day:'numeric',month:'short'}) =>
  new Intl.DateTimeFormat('en-GB',opts).format(new Date(`${value}T12:00:00`))

const weekday = (value, opts={weekday:'long',day:'numeric',month:'long'}) =>
  new Intl.DateTimeFormat('en-GB',opts).format(new Date(`${value}T12:00:00`))

const greeting = () => {
  const h = new Date().getHours()
  return h < 11 ? 'Pagii' : h < 16 ? 'Soree' : 'Malemm'
}

const getEventsForDate = (events, date) => {
  return events.filter(event => {
    if (!event.repeat || event.repeat === 'none') {
      return event.date === date
    }

    if (event.repeat === 'weekly') {
      const eventDay = new Date(`${event.date}T12:00:00`).getDay()
      const selectedDay = new Date(`${date}T12:00:00`).getDay()
      return date >= event.date && eventDay === selectedDay
    }

    return false
  }).sort((a,b) => a.start.localeCompare(b.start))
}

function App() {
  const [tasks,setTasks] = useStored('studyflow-tasks',seedTasks)
  const [events,setEvents] = useStored('studyflow-events',seedEvents)
  const [courses,setCourses] = useStored('studyflow-courses',seedCourses)

  const [tab,setTab] = useState('home')
  const [modal,setModal] = useState(null)
  const [editing,setEditing] = useState(null)
  const [query,setQuery] = useState('')
  const [filter,setFilter] = useState('All')
  const [selectedDate,setSelectedDate] = useState(plusDays(0))
  const [weekOffset,setWeekOffset] = useState(0)
  const [toast,setToast] = useState('')

  const completed = tasks.filter(t=>t.done).length
  const pending = tasks.filter(t=>!t.done)
  const todaysEvents = getEventsForDate(events,plusDays(0))

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(()=>setToast(''),2200)
  }

  const changeTab = (next) => {
    setTab(next)
    setQuery('')
  }

  const openAdd = (type) => {
    setEditing(null)
    setModal(type)
  }

  const openEdit = (type,item) => {
    setEditing(item)
    setModal(type)
  }

  const saveTask = (data) => {
    if(editing) {
      setTasks(old=>old.map(t=>t.id===editing.id?{...t,...data}:t))
    } else {
      setTasks(old=>[{id:Date.now(),...data,done:false},...old])
    }
    setModal(null)
    showToast(editing?'Task updated':'Task added')
  }

  const saveEvent = (data) => {
    if(editing) {
      setEvents(old=>old.map(e=>e.id===editing.id?{...e,...data}:e))
    } else {
      setEvents(old=>[...old,{id:Date.now(),...data}])
    }
    setModal(null)
    showToast(editing?'Class updated':'Schedule added')
  }

  const saveCourse = (data) => {
    if(editing) {
      setCourses(old=>old.map(c=>c.id===editing.id?{...c,...data}:c))
    } else {
      setCourses(old=>[...old,{id:Date.now(),...data}])
    }
    setModal(null)
    showToast(editing?'Category updated':'Category added')
  }

  const remove = (type,id) => {
    if(!window.confirm('Delete this item?')) return

    if(type==='task') setTasks(old=>old.filter(x=>x.id!==id))
    if(type==='event') setEvents(old=>old.filter(x=>x.id!==id))
    if(type==='course') setCourses(old=>old.filter(x=>x.id!==id))

    setModal(null)
    showToast('Deleted')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Sparkles size={17}/></div>
          <span>Deadline</span>
        </div>
        <button className="avatar" aria-label="Profile">R</button>
      </header>

      <main className="main-content">
        {tab==='home' && (
          <HomePage tasks={tasks} events={todaysEvents} completed={completed}
            pending={pending} onTab={changeTab} onEditTask={t=>openEdit('task',t)}/>
        )}

        {tab==='tasks' && (
          <TasksPage tasks={tasks} query={query} setQuery={setQuery}
            filter={filter} setFilter={setFilter} onAdd={()=>openAdd('task')}
            onEdit={t=>openEdit('task',t)}
            onToggle={id=>setTasks(old=>old.map(t=>t.id===id?{...t,done:!t.done}:t))}/>
        )}

        {tab==='schedule' && (
          <SchedulePage events={events} selectedDate={selectedDate}
            setSelectedDate={setSelectedDate} weekOffset={weekOffset}
            setWeekOffset={setWeekOffset} onAdd={()=>openAdd('event')}
            onEdit={e=>openEdit('event',e)}/>
        )}

        {tab==='courses' && (
          <CoursesPage courses={courses} tasks={tasks}
            onAdd={()=>openAdd('course')} onEdit={c=>openEdit('course',c)}/>
        )}
      </main>

      <nav className="bottom-nav">
        <NavItem active={tab==='home'} icon={<Home/>} label="Home" onClick={()=>changeTab('home')}/>
        <NavItem active={tab==='tasks'} icon={<ListTodo/>} label="Tasks" onClick={()=>changeTab('tasks')}/>
        <NavItem active={tab==='schedule'} icon={<CalendarDays/>} label="Schedule" onClick={()=>changeTab('schedule')}/>
        <NavItem active={tab==='courses'} icon={<BookOpen/>} label="Courses" onClick={()=>changeTab('courses')}/>
      </nav>

      {modal && (
        <Modal type={modal} item={editing} courses={courses}
          onClose={()=>setModal(null)}
          onSave={modal==='task'?saveTask:modal==='event'?saveEvent:saveCourse}
          onDelete={remove}/>
      )}

      {toast && <div className="toast"><Check size={16}/>{toast}</div>}
    </div>
  )
}

function NavItem({active,icon,label,onClick}) {
  return (
    <button className={`nav-item ${active?'active':''}`} onClick={onClick}>
      {React.cloneElement(icon,{size:21,strokeWidth:active?2.4:1.8})}
      <span>{label}</span>
    </button>
  )
}

function PageHeading({title,subtitle,eyebrow}) {
  return (
    <div className="page-heading">
      {eyebrow&&<div className="eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
      {subtitle&&<p>{subtitle}</p>}
    </div>
  )
}

function HomePage({tasks,events,completed,pending,onTab,onEditTask}) {
  const progress = tasks.length ? Math.round(completed/tasks.length*100) : 0

  return (
    <>
      <PageHeading title={`${greeting()}, Rifky 👋`} subtitle="Ngapain nyak hari ini?"/>
      <div className="eyebrow date-eyebrow">
        {weekday(plusDays(0),{weekday:'long',day:'numeric',month:'long'}).toUpperCase()}
      </div>

      <section className="focus-card">
        <div className="focus-copy">
          <span className="focus-label">TUJUAN HARI INI</span>
          <h2>Langkah kecil,<br/>Hasil Yang Besar.</h2>
          <p>Lu punya {pending.length} tugas belum di kerjain.</p>
        </div>
        <div className="sparkle-orb"><Sparkles size={20}/></div>
        <div className="focus-decoration">✦</div>
      </section>

      <div className="section-heading"><h2>Progress Lu</h2></div>
      <div className="stats-grid">
        <div className="stat-card">
          <span>Udah kelar</span>
          <strong>{completed}</strong>
          <small className="status good"><Check size={11}/> {progress}% Kelarr</small>
        </div>
        <div className="stat-card">
          <span>Jadwal Hari Ini</span>
          <strong>{events.length}</strong>
          <small className="status soft">Hari Ini</small>
        </div>
      </div>

      <div className="section-heading">
        <h2>Jadwal Hari Ini</h2>
        <button onClick={()=>onTab('schedule')}>Lihat Semua <ChevronRight size={14}/></button>
      </div>
      <div className="stack">
        {events.length ? events.slice(0,2).map(e=><EventCard key={e.id} event={e}/>) : <EmptyState text="Belum ada jadwal hari ini."/>}
      </div>

      <div className="section-heading">
        <h2>Tugas Mendatang</h2>
        <button onClick={()=>onTab('tasks')}>Lihat Semua <ChevronRight size={14}/></button>
      </div>
      <div className="stack">
        {pending.slice(0,3).map(t=><TaskCard key={t.id} task={t} onClick={()=>onEditTask(t)}/>)}
        {!pending.length&&<EmptyState text="Semua tugas sudah selesai. Nice work!"/>}
      </div>
    </>
  )
}

function TaskCard({task,onClick,onToggle}) {
  return (
    <article className={`task-card ${task.done?'is-done':''}`}>
      {onToggle && (
        <button className="check-button" onClick={()=>onToggle(task.id)} aria-label="Toggle complete">
          {task.done?<CheckCircle2 size={20}/>:<Circle size={20}/>}
        </button>
      )}
      <button className="task-main" onClick={onClick}>
        <strong>{task.title}</strong>
        <span>{task.course} · Due {fmtDate(task.due)}</span>
      </button>
      <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority.toUpperCase()}</span>
    </article>
  )
}

function EventCard({event,onClick}) {
  return (
    <article className={`event-card ${onClick?'is-clickable':''}`}
      onClick={onClick} role={onClick?'button':undefined}
      tabIndex={onClick?0:undefined}
      onKeyDown={onClick?(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onClick()}}:undefined}>
      <div className={`event-accent ${event.color||'purple'}`}></div>
      <div className="event-time">{event.start}<span>{event.end}</span></div>
      <div className="event-info"><strong>{event.title}</strong><span>{event.place}</span></div>
      <span className="event-type">{event.course==='Personal'?'PERSONAL':'CLASS'}</span>
    </article>
  )
}

function TasksPage({tasks,query,setQuery,filter,setFilter,onAdd,onEdit,onToggle}) {
  const shown = tasks.filter(t=>
    (filter==='All'||(filter==='To do'?!t.done:filter==='Done'?t.done:true)) &&
    `${t.title} ${t.course}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      <PageHeading title="My tasks" subtitle="Keep everything organized in one place."/>
      <div className="search-box">
        <Search size={17}/>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search your tasks"/>
      </div>
      <div className="filter-row">
        {['All','To do','Done'].map(f=>(
          <button key={f} className={`filter-chip ${filter===f?'selected':''}`} onClick={()=>setFilter(f)}>
            {f} <span>{f==='All'?tasks.length:f==='To do'?tasks.filter(t=>!t.done).length:tasks.filter(t=>t.done).length}</span>
          </button>
        ))}
      </div>
      <div className="section-heading"><h2>Tasks & assignments</h2><span className="muted-count">{shown.length} items</span></div>
      <div className="stack">
        {shown.map(t=><TaskCard key={t.id} task={t} onClick={()=>onEdit(t)} onToggle={onToggle}/>)}
        {!shown.length&&<EmptyState text="No tasks found. Try another search or add a task."/>}
      </div>
      <button className="fab" onClick={onAdd} aria-label="Add task"><Plus size={25}/></button>
    </>
  )
}

function SchedulePage({events,selectedDate,setSelectedDate,weekOffset,setWeekOffset,onAdd,onEdit}) {
  const base = new Date()
  base.setDate(base.getDate()-((base.getDay()+6)%7)+weekOffset*7)

  const days = Array.from({length:7},(_,i)=>{
    const d = new Date(base)
    d.setDate(base.getDate()+i)
    return iso(d)
  })

  const list = getEventsForDate(events,selectedDate)

  return (
    <>
      <PageHeading title="Schedule" subtitle="Your week at a glance."/>
      <div className="week-card">
        <button className="week-arrow" onClick={()=>setWeekOffset(x=>x-1)} aria-label="Previous week"><ChevronLeft size={17}/></button>
        {days.map(d=>(
          <button key={d} className={`day-cell ${selectedDate===d?'chosen':''}`} onClick={()=>setSelectedDate(d)}>
            <span>{new Intl.DateTimeFormat('en',{weekday:'narrow'}).format(new Date(`${d}T12:00:00`))}</span>
            <strong>{new Date(`${d}T12:00:00`).getDate()}</strong>
          </button>
        ))}
        <button className="week-arrow" onClick={()=>setWeekOffset(x=>x+1)} aria-label="Next week"><ChevronRight size={17}/></button>
      </div>
      <div className="section-heading schedule-title">
        <h2>{weekday(selectedDate)}</h2>
        <button className="icon-action" onClick={()=>{setSelectedDate(plusDays(0));setWeekOffset(0)}}>Today</button>
      </div>
      <div className="timeline">
        {list.map(e=><EventCard key={e.id} event={e} onClick={()=>onEdit(e)}/>)}
        {!list.length&&<EmptyState text="Nothing planned for this day. Enjoy the free time or add a class."/>}
      </div>
      <button className="fab" onClick={onAdd} aria-label="Add schedule"><Plus size={25}/></button>
    </>
  )
}

function CoursesPage({courses,tasks,onAdd,onEdit}) {
  return (
    <>
      <PageHeading title="Courses & categories" subtitle="Your semester and personal activities in one place."/>
      <div className="section-heading"><h2>All categories</h2><span className="muted-count">{courses.length} categories</span></div>
      <div className="stack course-stack">
        {courses.map(c=>{
          const count=tasks.filter(t=>t.course===c.name&&!t.done).length
          return (
            <button className="course-card" key={c.id} onClick={()=>onEdit(c)}>
              <div className={`course-monogram ${c.color}`}>{c.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
              <div className="course-info">
                <strong>{c.name}</strong>
                <span>{c.name==='Personal'?'Personal category':c.code||'Course category'}</span>
                <small>{count} pending {count===1?'task':'tasks'}</small>
              </div>
              <ChevronRight size={19} className="course-chevron"/>
            </button>
          )
        })}
        {!courses.length&&<EmptyState text="Add your first category to get started."/>}
      </div>
      <button className="fab" onClick={onAdd} aria-label="Add category"><Plus size={25}/></button>
    </>
  )
}

function EmptyState({text}) {
  return (
    <div className="empty-state">
      <div><Sparkles size={19}/></div>
      <p>{text}</p>
    </div>
  )
}

function Modal({type,item,courses,onClose,onSave,onDelete}) {
  const isTask=type==='task'
  const isEvent=type==='event'
  const isCourse=type==='course'

  const [form,setForm]=useState(()=>(
    isTask ? {
      title:item?.title||'',course:item?.course||courses[0]?.name||'',
      due:item?.due||plusDays(1),priority:item?.priority||'Medium',notes:item?.notes||''
    } : isEvent ? {
      title:item?.title||'',course:item?.course||courses[0]?.name||'Personal',
      date:item?.date||plusDays(0),start:item?.start||'08:00',end:item?.end||'09:40',
      place:item?.place||'',color:item?.color||'purple',repeat:item?.repeat||'none'
    } : {
      name:item?.name||'',code:item?.code||'',lecturer:item?.lecturer||'',
      room:item?.room||'',color:item?.color||'purple'
    }
  ))

  const update=(key,value)=>setForm(old=>({...old,[key]:value}))
  const submit=e=>{
    e.preventDefault()
    if(isCourse && !form.name.trim()) return
    onSave(isCourse?{...form,name:form.name.trim()}:form)
  }

  const title=isTask?'task':isEvent?'class':'category'

  return (
    <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
      <form className="modal-sheet" onSubmit={submit}>
        <div className="modal-grabber"/>
        <div className="modal-header">
          <div><span className="eyebrow">{item?'EDIT':'NEW'} {title.toUpperCase()}</span><h2>{item?'Update':'Add'} {title}</h2></div>
          <button type="button" className="close-button" onClick={onClose} aria-label="Close"><X size={20}/></button>
        </div>

        {isCourse ? (
          <>
            <Field label="Category name"><input required value={form.name} onChange={e=>update('name',e.target.value)} placeholder="e.g. Personal"/></Field>
            <Field label="Code (optional)"><input value={form.code} onChange={e=>update('code',e.target.value)} placeholder="Course code"/></Field>
            <Field label="Lecturer (optional)"><input value={form.lecturer} onChange={e=>update('lecturer',e.target.value)} placeholder="Lecturer name"/></Field>
            <Field label="Location (optional)"><input value={form.room} onChange={e=>update('room',e.target.value)} placeholder="Room or online"/></Field>
            <Field label="Color">
              <select value={form.color} onChange={e=>update('color',e.target.value)}>
                <option value="purple">Green</option><option value="green">Mint</option>
                <option value="amber">Amber</option><option value="rose">Rose</option><option value="slate">Slate</option>
              </select>
            </Field>
          </>
        ) : (
          <>
            <Field label={isTask?'Task title':'Class name'}>
              <input required value={form.title} onChange={e=>update('title',e.target.value)} placeholder={isTask?'What do you need to do?':'e.g. Kalkulus'}/>
            </Field>
            <Field label="Course / category">
              <select value={form.course} onChange={e=>update('course',e.target.value)}>
                {courses.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
                {!courses.some(c=>c.name===form.course)&&form.course&&<option value={form.course}>{form.course}</option>}
              </select>
            </Field>
            {isTask ? (
              <>
                <Field label="Due date"><input type="date" required value={form.due} onChange={e=>update('due',e.target.value)}/></Field>
                <Field label="Priority">
                  <select value={form.priority} onChange={e=>update('priority',e.target.value)}>
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </Field>
                <Field label="Notes (optional)"><textarea rows="3" value={form.notes} onChange={e=>update('notes',e.target.value)} placeholder="Add a little detail..."/></Field>
              </>
            ) : (
              <>
                <Field label="Date"><input type="date" required value={form.date} onChange={e=>update('date',e.target.value)}/></Field>
                <Field label="Repeat">
                  <select value={form.repeat} onChange={e=>update('repeat',e.target.value)}>
                    <option value="none">Does not repeat</option><option value="weekly">Every week</option>
                  </select>
                </Field>
                <div className="form-grid">
                  <Field label="Start time"><input type="time" required value={form.start} onChange={e=>update('start',e.target.value)}/></Field>
                  <Field label="End time"><input type="time" required value={form.end} onChange={e=>update('end',e.target.value)}/></Field>
                </div>
                <Field label="Location"><input value={form.place} onChange={e=>update('place',e.target.value)} placeholder="Room, building, or online"/></Field>
              </>
            )}
          </>
        )}

        <div className="modal-actions">
          {item&&<button type="button" className="delete-button" onClick={()=>onDelete(isTask?'task':isEvent?'event':'course',item.id)} aria-label="Delete"><Trash2 size={17}/></button>}
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-button">{item?'Save changes':`Add ${title}`}</button>
        </div>
      </form>
    </div>
  )
}

function Field({label,children}) {
  return <label className="field"><span>{label}</span>{children}</label>
}

createRoot(document.getElementById('root')).render(<App/>)

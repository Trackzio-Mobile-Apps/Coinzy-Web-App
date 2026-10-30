const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('coinzy-web-timeline.html', 'utf8');
const script = html.split('<script>')[1].split('</script>')[0];
const context = vm.createContext({ localStorage: { getItem: () => null }, Date });
vm.runInContext(script.slice(0, script.indexOf('\nfunction save()')) + '\nglobalThis.run=(tasks,asOf="2026-10-05")=>{state={start:"2026-10-05",asOf,rate:2,hoursPerDay:8,tasks};return {summary:calculate(),tasks}};globalThis.status=taskStatus;globalThis.defaults=state.tasks;globalThis.isHour=isHourTask;', context);
const task = (id, overrides={}) => ({id,section:'Work',screens:8,progress:0,agent:'A',after:0,...overrides});
const date = value => value && [value.getFullYear(),String(value.getMonth()+1).padStart(2,'0'),String(value.getDate()).padStart(2,'0')].join('-');
let output=context.run([task(1,{progress:100,completedOn:'2026-10-02'}),task(2,{progress:75,after:1}),task(3,{after:2})]);
assert.equal(output.tasks[0].days,0);
assert.equal(date(output.tasks[0].end),'2026-10-02');
assert.equal(output.tasks[1].days,1);
assert.equal(date(output.tasks[1].begin),'2026-10-05');
assert.equal(date(output.tasks[2].begin),'2026-10-06');
assert.equal(output.summary.effort,5);
assert.equal(output.summary.progress,58); // Weight by original effort, not remaining work.
let earlier=context.run([task(1,{progress:100,completedOn:'2026-10-05'}),task(2,{after:1})]);
let later=context.run([task(1,{progress:100,completedOn:'2026-10-08'}),task(2,{after:1})]);
assert(date(earlier.summary.last)<date(later.summary.last));
output=context.run([task(1),task(2,{progress:100,completedOn:'2026-10-02'}),task(3),task(4,{agent:'B'}),task(5,{agent:'QA',section:'Review and fixes',screens:2})]);
assert.equal(date(output.tasks[2].begin),'2026-10-09'); // Completed row cannot reset a busy lane.
assert.equal(date(output.tasks[3].begin),'2026-10-05'); // Independent lane starts in parallel.
assert.equal(date(output.tasks[4].begin),'2026-10-15');
output=context.run([task(1,{screens:null,progress:100,completedOn:'2026-10-05'}),task(2,{after:1})]);
assert.equal(context.status(output.tasks[0]),'Done');
assert.equal(date(output.tasks[1].begin),'2026-10-06');
output=context.run([task(1,{screens:null}),task(2,{after:1}),task(3,{section:'Review and fixes',agent:'QA'})]);
assert.equal(context.status(output.tasks[1]),'Waiting on dependency');
assert.equal(output.tasks[2].begin,null);
output=context.run([task(1,{progress:50})],'2026-10-10');
assert.equal(date(output.tasks[0].begin),'2026-10-12'); // Forecast date and weekends honored.
output=context.run(context.defaults);
assert.equal(output.tasks.find(t=>t.id===3).days,0);
assert.equal(output.tasks.find(t=>t.id===14).progress,100);
assert.equal(output.tasks.find(t=>t.id===14).days,0);
assert.equal(output.tasks.find(t=>t.id===15).progress,100);
assert.equal(output.tasks.find(t=>t.id===15).days,0);
// Sync 17: ≥90% parents closed; leftovers track hours.
assert.equal(output.tasks.find(t=>t.id===2).progress,100);
assert.equal(output.tasks.find(t=>t.id===5).progress,95);
assert.equal(output.tasks.find(t=>t.id===5).screens,null); // JWT remainder unscheduled
assert.equal(output.tasks.find(t=>t.id===7).progress,100);
assert.equal(output.tasks.find(t=>t.id===8).progress,100);
assert.equal(output.tasks.find(t=>t.id===9).progress,100);
assert.equal(output.tasks.find(t=>t.id===16).progress,100);
assert.equal(output.tasks.find(t=>t.id===19).progress,100);
assert.equal(output.tasks.find(t=>t.id===20).screens,null);
assert.equal(output.tasks.find(t=>t.id===21).screens,null);
assert.equal(output.tasks.find(t=>t.id===22).progress,0);
assert.equal(output.tasks.find(t=>t.id===22).hours,40); // bug backlog @ 32 pts/day
assert.equal(output.tasks.find(t=>t.id===22).screens,null);
assert.equal(output.tasks.find(t=>t.id===22).blocked,false); // Payments deferred must not block QA
assert.equal(output.summary.hoursLeft,40);
assert.equal(output.tasks.find(t=>t.id===17).progress,100);
assert.equal(output.tasks.find(t=>t.id===18).progress,100);
assert.equal(output.tasks.find(t=>t.id===23).days,0);
const landingCta=output.tasks.find(t=>t.id===24);
const rateMatch=output.tasks.find(t=>t.id===25);
const socket=output.tasks.find(t=>t.id===26);
const manage=output.tasks.find(t=>t.id===27);
const billing=output.tasks.find(t=>t.id===28);
assert.equal(landingCta.hours,1);
assert.equal(landingCta.progress,100);
assert.equal(landingCta.hoursLeft,0);
assert.equal(rateMatch.hours,3);
assert.equal(rateMatch.progress,100);
assert.equal(rateMatch.hoursLeft,0);
assert.equal(socket.hours,8);
assert.equal(socket.progress,100);
assert.equal(socket.hoursLeft,0);
assert.equal(manage.progress,100); // cancelled / out of scope
assert.equal(manage.hours,null);
assert.equal(billing.hours,1);
assert.equal(billing.progress,100);
assert.equal(context.isHour(landingCta),true);
assert.equal(output.summary.hoursLeft,40); // leftover 24–28 closed; task 22 bug backlog 40h
assert.equal(socket.days,0);
output=context.run([task(1,{screens:null,hours:4,progress:50,agent:'A'})]);
assert.equal(output.tasks[0].hoursLeft,2);
assert.equal(output.summary.hoursLeft,2);
console.log(`PASS: early completion, remaining work, dependency/lane constraints, weekends, QA, hour leftovers. Forecast: ${date(output.summary.last)}, ${output.summary.hoursLeft} leftover hours.`);

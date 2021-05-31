document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', function(event){
    event.preventDefault();
    send_email();
  });
  // document.querySelector('#compose-form').onsubmit = test();
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(element => {
        const email = document.createElement('div');
        email.classList.add("container");
        email.classList.add("email");
        email.style.border = "1px solid black";
        if (element.read === false) {
          email.style.backgroundColor = "white";
        }else{
          email.style.backgroundColor = "gray";
        }
        email.style.marginBottom = "10px";
        const sender = document.createElement('p');
        sender.innerHTML = `<b>From: </b>${element.sender}`;
        email.append(sender);
        const subject = document.createElement('p');
        subject.innerHTML = `<b>Subject: </b>${element.subject}`;
        email.append(subject);
        const timestamp = document.createElement('p');
        timestamp.innerHTML = `${element.timestamp}`;
        email.append(timestamp);
        email.addEventListener('click', () => load_email(element.id));
        const archive = document.createElement('button');
        archive.classList.add("btn");
        archive.classList.add("btn-primary");
        archive.style.marginBottom = "5px";
        if (mailbox == "inbox") {
          archive.innerHTML = "Add to archive";
          archive.addEventListener('click', function(event){
            event.stopPropagation()
            archive_email(element.id, true);
          });
          email.append(archive);
        }else if (mailbox == "archive") {
          archive.innerHTML = "Remove from archive";
          archive.addEventListener('click', function(event){
            event.stopPropagation()
            archive_email(element.id, false);
          });
          email.append(archive);
        }
        document.querySelector('#emails-view').append(email);
      });
  });

}

function send_email() {

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      if (result.error) {
        alert(result.error);
      }else{
        alert(result.message);
        load_mailbox('sent');
      }
  })
  .catch(error => {
    console.log('Error:', error);
  });
}

function load_email(email_id){
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
      document.querySelector('#email-view').innerHTML = "";
      const body = document.createElement('div');
      body.classList.add("container");
      body.classList.add("email");
      const sender = document.createElement('p');
      sender.innerHTML = `<b>From: ${email.sender}</b>`;
      body.append(sender);
      let recips = email.recipients.join(", ");
      const recipients = document.createElement('p');
      recipients.innerHTML = `<b>To: </b>${recips}`;
      body.append(recipients);
      const subject = document.createElement('p');
      subject.innerHTML = `<b>Subject: </b>${email.subject}`;
      body.append(subject);
      const timestamp = document.createElement('p');
      timestamp.innerHTML = `${email.timestamp}`;
      body.append(timestamp);
      const reply = document.createElement('button');
      reply.classList.add("btn");
      reply.classList.add("btn-primary");
      reply.style.marginBottom = "5px";
      reply.innerHTML = "Reply";
      reply.addEventListener('click', () => reply_email(email.sender, email.subject, email.timestamp, email.body));
      body.append(reply);
      const hr = document.createElement('hr');
      body.append(hr);
      const text = document.createElement('p');
      text.innerHTML = `${email.body}`;
      body.append(text);
      document.querySelector('#email-view').append(body);
  });
}

function archive_email(email_id, archived, element) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: archived
    })
  })
  .then(response => {
    if (response.ok) {
      load_mailbox('inbox');
    }
  });
  
}

function reply_email(sender, subject, timestamp, content) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = `${sender}`;
  document.querySelector('#compose-subject').value = `Re: ${subject}`;
  document.querySelector('#compose-body').value = `On ${timestamp} ${sender} wrote: ${content}`;
}

// function test() {
//   console.log("makaka!!!!");
//   return false;
// }
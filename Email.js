class Email {

  static sendEmail(recipient, subject, body) {
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      body: body
    })

    Logger.log(`Email "${subject}" sent to ${recipient}`)
  }
}
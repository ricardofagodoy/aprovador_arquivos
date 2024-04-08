class Email {

  static sendEmail(recipient, subject, body) {

    if (!recipient)
      return

    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      body: body
    })

    Logger.log(`Email "${subject}" sent to ${recipient}`)
  }
}
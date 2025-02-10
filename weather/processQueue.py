import pika, sys, os
from background_task import background
from logging import getLogger
import africastalking


logger = getLogger(__name__)
@background(schedule=10)
def processQueue():
    logger.debug('demo_task. message={0}'.format("message"))
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
    channel = connection.channel()
    
    channel.queue_declare(queue='sms')
    # channel.queue_declare(queue='email')
    
    def callback(ch, method, properties, body):
        decoded_body = body.decode('utf-8')
        message, recepient =parse_weather_message(decoded_body) 
        sendMessageAsSMS(message,recepient)
        print(f"receivedl {body}")
    
    channel.basic_consume(queue='sms', on_message_callback=callback, auto_ack=True)
    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()
    
    
    
def sendMessageAsSMS(message,recepient):
   print (os.getenv('API_KEY'))
   africastalking.initialize(
    username=os.getenv('USERNAME'),
    api_key=os.getenv('API_KEY')
)

   sms = africastalking.SMS
   # Set your shortCode or senderId
   sender = os.getenv('SENDER')
   try:
         recipients = [f"{recepient}"]
         response = sms.send(message, recipients, sender)
         print(response)
         return (response)
   except Exception as e:
         print (f'Houston, we have a problem: {e}')
   return message

def parse_weather_message(text):
    
    body = text.split("#_#")
    
    
    if len(body) !=2:
        raise ValueError("Message format is not right")
    
    
    # Split the text into two parts
    message_part = body[0]
    phone_number_part = body[1]
    print(f"received {message_part}")
    
    return [message_part, phone_number_part]
    
 

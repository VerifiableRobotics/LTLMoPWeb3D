FROM agilgur5/ltlmop

# install python requirements (system wide to match numpy/scipy)
WORKDIR /web
COPY ./requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

# mount core in here
VOLUME /web
WORKDIR /web

# expose dev server port
EXPOSE 5000

CMD python application.py

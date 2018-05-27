FROM davidcaste/alpine-tomcat:tomcat8
RUN apk add --no-cache wget
ENV UAA_VERSION=4.13.4
RUN mkdir /env
ADD ./env/uaa.yml /env/uaa.yml
WORKDIR /opt/tomcat/webapps
ENV CLOUD_FOUNDRY_CONFIG_PATH=/env
RUN wget -O ROOT.war "http://central.maven.org/maven2/org/cloudfoundry/identity/cloudfoundry-identity-uaa/${UAA_VERSION}/cloudfoundry-identity-uaa-${UAA_VERSION}.war"
ENV JAVA_OPTIONS="-Djava.security.egd=file:/dev/./urandom -Xmx256m -Xms100m"
CMD [ "/opt/tomcat/bin/catalina.sh","run" ]

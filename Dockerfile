FROM davidcaste/alpine-tomcat:tomcat8
RUN apk add --no-cache wget
ENV UAA_VERSION=4.13.4
WORKDIR /opt/tomcat/webapps
RUN wget "http://central.maven.org/maven2/org/cloudfoundry/identity/cloudfoundry-identity-uaa/${UAA_VERSION}/cloudfoundry-identity-uaa-${UAA_VERSION}.war" ROOT.war
ENV JAVA_OPTIONS="-Djava.security.egd=file:/dev/./urandom -Xmx256m -Xms100m"
CMD [ "/opt/tomcat/bin/catalina.sh","run" ]

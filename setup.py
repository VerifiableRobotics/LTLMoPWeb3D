# this should probably be in LTLMoP's setup.py, but I'm not sure how setup works with submodules...
# or how setup works at all...
import os

# compile jtlv compiler initially (build the java source with javac)
os.chdir('LTLMoP/src/etc/jtlv')
os.system('sh build.sh')
os.chdir('../../../..')